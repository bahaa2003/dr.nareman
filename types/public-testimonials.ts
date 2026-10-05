export interface PublicTestimonialImage {
  url: string;
  alt: string;
}

export interface PublicTestimonial {
  id: string;
  image: PublicTestimonialImage;
}

export interface PublicTestimonialListResponse {
  success: true;
  items: PublicTestimonial[];
}
