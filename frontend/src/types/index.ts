export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Metric {
  id: string;
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
}