import { AboutTeaser } from "@/components/home/AboutTeaser";
import { CategoryHighlights } from "@/components/home/CategoryHighlights";
import { FeaturedDrinks } from "@/components/home/FeaturedDrinks";
import { HeroSection } from "@/components/home/HeroSection";

export function HomePage() {
  return (
    <div data-ocid="home.page" className="flex flex-col">
      <HeroSection />
      <FeaturedDrinks />
      <CategoryHighlights />
      <AboutTeaser />
    </div>
  );
}
