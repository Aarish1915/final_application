import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="section-snap relative flex items-center justify-center overflow-hidden h-[100dvh] min-h-[560px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/homepage-bg.png"
          alt="Ingri luxury café interior"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-dark/85 via-emerald-deep/70 to-emerald-dark/90" />
      </div>

      {/* Spotlight glow — hidden on very small screens for perf */}
      <div
        className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(43 52% 54% / 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      {/* mt-[-10vh] on mobile shifts content above dead-centre so CTAs clear the bottom */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl w-full flex flex-col items-center -mt-[8vh] sm:mt-0">
        {/* Gold line */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 40, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-[2px] bg-gold mx-auto mb-3 sm:mb-6 md:h-[60px]"
        />

        {/* Logo text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-logo text-4xl sm:text-6xl md:text-8xl font-bold text-cream tracking-wider mb-1 sm:mb-2"
        >
          ingri
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="font-accent text-sm sm:text-xl md:text-2xl text-gold tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2"
        >
          at museo
        </motion.p>

        {/* Gold underline */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 100 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="h-[1.5px] bg-gold mx-auto mb-4 sm:mb-8"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="font-body text-white text-xs sm:text-base md:text-lg tracking-wide leading-relaxed mb-5 sm:mb-10 max-w-[280px] sm:max-w-lg mx-auto"
        >
          Authentic Ready-to-Eat Meals &amp; Handcrafted Spice Blends — Where Culinary Art Meets Museum Living
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="flex flex-row gap-2 sm:gap-4 justify-center items-center"
        >
          <a
            href="/reserve"
            className="inline-block font-heading text-[10px] sm:text-sm tracking-[0.12em] sm:tracking-[0.2em] px-5 sm:px-8 py-2.5 sm:py-3 rounded-full border-2 border-gold text-gold hover:bg-gold hover:text-emerald-deep transition-all duration-300 gold-glow text-center whitespace-nowrap"
          >
            RESERVE TABLE
          </a>
          <a
            href="/menu"
            className="inline-block font-heading text-[10px] sm:text-sm tracking-[0.12em] sm:tracking-[0.2em] px-5 sm:px-8 py-2.5 sm:py-3 rounded-full border border-cream/30 text-cream hover:border-gold hover:text-gold transition-all duration-300 text-center whitespace-nowrap"
          >
            EXPLORE MENU
          </a>
        </motion.div>
      </div>
    </section>
  );
}
