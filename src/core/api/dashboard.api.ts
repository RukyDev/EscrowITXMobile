import { apiClient } from './axios';
import { DashboardResponse } from '../types/dashboard.types'

export const getDashboard = async (): Promise<DashboardResponse> => {
  return await apiClient.get('/api/services/app/DashboardServices/GetDashboard');
}