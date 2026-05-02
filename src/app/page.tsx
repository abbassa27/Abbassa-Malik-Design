import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import MediumProjects from "@/components/MediumProjects";
import About from "@/components/About";
import Pricing from "@/components/Pricing";
import CtaBar from "@/components/CtaBar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-void min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <Portfolio />
      <Testimonials />
	  <MediumProjects />
      <About />
      <Pricing />
      <CtaBar />
      <Contact />
      <Footer />
    </main>
  );
}