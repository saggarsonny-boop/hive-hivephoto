export interface SearchFilters {
  dateFrom?: string; // ISO date
  dateTo?: string;   // ISO date
  tags?: string[];
  scene?: string;
  location?: string;
  personName?: string;
  freeText?: string;
}

export interface SearchRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  filters: SearchFilters;
  photos: import("./photo").Photo[];
  total: number;
  page: number;
  limit: number;
}
