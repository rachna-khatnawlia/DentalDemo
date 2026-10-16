import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import { ServiceCategory } from "../types/models";
import { MOCK_CATEGORIES } from "./mockData";

export const serviceCategoryService = {
  /**
   * Fetch active dental treatment categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get<ServiceCategory[]>(
        API_CONFIG.ENDPOINTS.SERVICES.LIST
      );
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return MOCK_CATEGORIES;
  },
};

export default serviceCategoryService;
