import Shell from '@/components/ui/Shell';
import About from '@/components/About/About';
import Services from '@/components/Services/Services';
import Projects from '@/components/Projects/Projects';
import Reviews from '@/components/Reviews/Reviews';
import Connect from '@/components/Connect/Connect';
import Footer from '@/components/Connect/Footer';

export default function Home() {
  return (
    <Shell>
      <main>
        <About />
        <Services />
        <Projects />
        <Reviews />
        <Connect />
      </main>
      <Footer />
    </Shell>
  );
}
