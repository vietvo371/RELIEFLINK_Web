/**
 * Request Priority & Auto-Matching Service
 * Tính toán độ ưu tiên và tự động match yêu cầu với nguồn lực
 */

import { prisma } from "./prisma";

// Các yếu tố ảnh hưởng đến độ ưu tiên
export interface PriorityFactors {
  urgencyLevel: string; // cao, trung_binh, thap
  numberOfPeople: number;
  requestType: string; // thuc_pham, nuoc, thuoc, cho_o, cuu_ho
  timeElapsed: number; // giờ từ khi tạo request
  distance: number; // km đến trung tâm gần nhất
  weatherCondition?: string; // mua_bao, nang_nong, binh_thuong
}

export class RequestWorkflowService {
  /**
   * Tính toán điểm ưu tiên cho yêu cầu
   */
  static calculatePriorityScore(factors: PriorityFactors): number {
    let score = 0;

    // 1. Độ khẩn cấp (0-40 điểm)
    const urgencyScores = {
      cao: 40,
      trung_binh: 25,
      thap: 10,
    };
    score += urgencyScores[factors.urgencyLevel as keyof typeof urgencyScores] || 10;

    // 2. Số người ảnh hưởng (0-30 điểm)
    if (factors.numberOfPeople >= 100) score += 30;
    else if (factors.numberOfPeople >= 50) score += 25;
    else if (factors.numberOfPeople >= 20) score += 20;
    else if (factors.numberOfPeople >= 10) score += 15;
    else score += 10;

    // 3. Loại yêu cầu (0-20 điểm)
    const typeScores = {
      cuu_ho: 20,
      thuoc: 18,
      nuoc: 15,
      thuc_pham: 12,
      cho_o: 10,
    };
    score += typeScores[factors.requestType as keyof typeof typeScores] || 8;

    // 4. Thời gian (0-10 điểm) - càng lâu càng cao điểm
    const hoursBonus = Math.min(Math.floor(factors.timeElapsed / 2), 10);
    score += hoursBonus;

    // 5. Khoảng cách (trừ điểm nếu quá xa)
    if (factors.distance > 50) score -= 10;
    else if (factors.distance > 20) score -= 5;

    // 6. Điều kiện thời tiết
    if (factors.weatherCondition === "mua_bao") score += 15;
    else if (factors.weatherCondition === "nang_nong") score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Tự động match yêu cầu với nguồn lực phù hợp
   */
  static async findBestResourceMatch(requestId: number) {
    try {
      const request = await prisma.yeu_cau_cuu_tros.findUnique({
        where: { id: requestId },
        include: {
          nguoi_dung: true,
        },
      });

      if (!request) {
        throw new Error("Không tìm thấy yêu cầu");
      }

      // Lấy tất cả nguồn lực khả dụng (không filter theo loại trước, để linh hoạt hơn)
      const allAvailableResources = await prisma.nguon_lucs.findMany({
        where: {
          trang_thai: "san_sang",
          so_luong: {
            gt: 0,
          },
        },
        include: {
          trung_tam: true,
        },
      });

      if (allAvailableResources.length === 0) {
        console.log("Không có nguồn lực khả dụng nào trong hệ thống");
        return null;
      }

      // Extract keywords từ loại yêu cầu để match linh hoạt hơn
      const requestKeywords = this.extractKeywords(request.loai_yeu_cau);
      console.log(`[Auto-match] Request: "${request.loai_yeu_cau}" -> Keywords:`, requestKeywords);
      console.log(`[Auto-match] Available resources: ${allAvailableResources.length}`);
      
      // Filter và tính điểm cho từng nguồn lực
      const scoredResources = allAvailableResources
        .map((resource) => {
          const resourceKeywords = this.extractKeywords(resource.loai);
          
          // Tính độ tương đồng giữa request và resource
          const matchScore = this.calculateMatchScore(requestKeywords, resourceKeywords);
          
          // Debug logging cho resource có điểm match > 0
          if (matchScore > 0) {
            console.log(`[Auto-match] Resource "${resource.ten_nguon_luc}" (${resource.loai}) - Match score: ${matchScore.toFixed(3)}`);
          }
          
          // Chỉ giữ lại những resource có điểm match > 0 hoặc có từ khóa chung
          if (matchScore === 0 && !this.hasCommonWords(request.loai_yeu_cau, resource.loai)) {
            return null;
          }

          // Tính khoảng cách
          const distance = this.calculateDistance(
            request.vi_do ? Number(request.vi_do) : 0,
            request.kinh_do ? Number(request.kinh_do) : 0,
            resource.trung_tam.vi_do ? Number(resource.trung_tam.vi_do) : 0,
            resource.trung_tam.kinh_do ? Number(resource.trung_tam.kinh_do) : 0
          );

          // Tính điểm tổng hợp
          let totalScore = matchScore * 50; // 50 điểm cho độ tương đồng
          
          // Điểm dựa trên khoảng cách (gần hơn = điểm cao hơn)
          totalScore += Math.max(0, 100 - distance * 2);

          // Điểm dựa trên số lượng khả dụng
          const availabilityRatio = resource.so_luong / (resource.so_luong + (resource.so_luong_toi_thieu || 0));
          totalScore += availabilityRatio * 50;

          return {
            resource,
            score: totalScore,
            distance,
            matchScore,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (scoredResources.length === 0) {
        console.log(`Không tìm thấy nguồn lực phù hợp cho yêu cầu: ${request.loai_yeu_cau}`);
        return null;
      }

      // Sắp xếp theo điểm cao nhất
      scoredResources.sort((a, b) => b.score - a.score);

      const bestMatch = scoredResources[0];

      // Cập nhật thông tin matching vào request
      await prisma.yeu_cau_cuu_tros.update({
        where: { id: requestId },
        data: {
          id_nguon_luc_match: bestMatch.resource.id,
          khoang_cach_gan_nhat: bestMatch.distance,
          trang_thai_matching: "da_match",
        },
      });

      return {
        resource: bestMatch.resource,
        distance: bestMatch.distance,
        score: bestMatch.score,
        matchScore: bestMatch.matchScore,
        alternatives: scoredResources.slice(1, 3), // 2 lựa chọn thay thế
      };
    } catch (error) {
      console.error("Auto-matching error:", error);
      throw error;
    }
  }

  /**
   * Extract keywords từ text để matching linh hoạt
   */
  private static extractKeywords(text: string): string[] {
    const normalized = text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
    
    // Từ khóa phổ biến trong cứu trợ
    const keywords: string[] = [];
    
    if (normalized.includes("thuc pham") || normalized.includes("food")) {
      keywords.push("thucpham", "food");
    }
    if (normalized.includes("nuoc") || normalized.includes("water")) {
      keywords.push("nuoc", "water");
    }
    if (normalized.includes("thuoc") || normalized.includes("medical") || normalized.includes("yte")) {
      keywords.push("thuoc", "medical", "yte");
    }
    if (normalized.includes("cho o") || normalized.includes("shelter") || normalized.includes("chỗ ở")) {
      keywords.push("choo", "shelter");
    }
    if (normalized.includes("cuu ho") || normalized.includes("rescue")) {
      keywords.push("cuuho", "rescue");
    }
    if (normalized.includes("quan ao") || normalized.includes("clothing")) {
      keywords.push("quanao", "clothing");
    }
    
    // Thêm các từ đơn lẻ quan trọng
    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    keywords.push(...words);
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Tính điểm match giữa request keywords và resource keywords
   */
  private static calculateMatchScore(requestKeywords: string[], resourceKeywords: string[]): number {
    if (requestKeywords.length === 0 || resourceKeywords.length === 0) {
      return 0;
    }
    
    let matches = 0;
    for (const reqKeyword of requestKeywords) {
      for (const resKeyword of resourceKeywords) {
        // Exact match
        if (reqKeyword === resKeyword) {
          matches += 3;
        }
        // Partial match (contains) - linh hoạt hơn
        else if (reqKeyword.includes(resKeyword) || resKeyword.includes(reqKeyword)) {
          matches += 2;
        }
        // Similar words (chỉ khác dấu hoặc có 1-2 ký tự khác)
        else if (this.areSimilar(reqKeyword, resKeyword)) {
          matches += 1;
        }
      }
    }
    
    // Normalize score (0-1)
    const maxPossibleMatches = requestKeywords.length * resourceKeywords.length;
    return maxPossibleMatches > 0 ? matches / (maxPossibleMatches * 2) : 0;
  }

  /**
   * Kiểm tra 2 từ có tương tự nhau không (hỗ trợ typo và variation)
   */
  private static areSimilar(word1: string, word2: string): boolean {
    if (Math.abs(word1.length - word2.length) > 2) return false;
    
    // Check if one contains the other (with minimum 3 chars)
    const minLen = Math.min(word1.length, word2.length);
    if (minLen >= 3) {
      if (word1.substring(0, minLen) === word2.substring(0, minLen)) return true;
      if (word1.includes(word2) || word2.includes(word1)) return true;
    }
    
    return false;
  }

  /**
   * Kiểm tra xem có từ chung nào giữa request và resource không
   */
  private static hasCommonWords(text1: string, text2: string): boolean {
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    for (const w1 of words1) {
      for (const w2 of words2) {
        if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Cập nhật điểm ưu tiên cho yêu cầu
   */
  static async updateRequestPriority(requestId: number) {
    try {
      const request = await prisma.yeu_cau_cuu_tros.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error("Không tìm thấy yêu cầu");
      }

      const timeElapsed = (Date.now() - request.created_at.getTime()) / (1000 * 60 * 60); // hours

      const factors: PriorityFactors = {
        urgencyLevel: request.do_uu_tien,
        numberOfPeople: request.so_nguoi,
        requestType: request.loai_yeu_cau,
        timeElapsed,
        distance: request.khoang_cach_gan_nhat ? Number(request.khoang_cach_gan_nhat) : 999,
      };

      const priorityScore = this.calculatePriorityScore(factors);

      await prisma.yeu_cau_cuu_tros.update({
        where: { id: requestId },
        data: {
          diem_uu_tien: priorityScore,
        },
      });

      return priorityScore;
    } catch (error) {
      console.error("Priority update error:", error);
      throw error;
    }
  }

  /**
   * Map loại yêu cầu thành loại nguồn lực
   */
  private static mapRequestTypeToResourceType(requestType: string): string {
    const mapping: { [key: string]: string } = {
      thuc_pham: "food",
      nuoc: "water", 
      thuoc: "medical",
      cho_o: "shelter",
      cuu_ho: "rescue",
    };
    return mapping[requestType] || requestType;
  }

  /**
   * Tính khoảng cách giữa 2 điểm (Haversine formula)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Batch update priorities cho tất cả requests đang chờ
   */
  static async batchUpdatePriorities() {
    try {
      const pendingRequests = await prisma.yeu_cau_cuu_tros.findMany({
        where: {
          trang_thai: {
            in: ["cho_xu_ly", "dang_xu_ly"],
          },
          trang_thai_phe_duyet: "da_phe_duyet",
        },
        select: { id: true },
      });

      console.log(`Updating priorities for ${pendingRequests.length} requests...`);

      for (const request of pendingRequests) {
        await this.updateRequestPriority(request.id);
      }

      console.log("Batch priority update completed!");
    } catch (error) {
      console.error("Batch update error:", error);
    }
  }
}