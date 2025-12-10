import { motion } from 'framer-motion';
import { Search, CalendarCheck, CreditCard, Key } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search & Explore',
    description:
      'Browse through hundreds of verified hostels and rooms with detailed filters.',
  },
  {
    icon: CalendarCheck,
    title: 'Select & Book',
    description:
      'Choose your preferred room and check-in date. Review all details before booking.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description:
      'Pay securely through Razorpay. Multiple payment options available.',
  },
  {
    icon: Key,
    title: 'Move In',
    description:
      'Receive your room allocation confirmation and move in on your selected date.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Getting your hostel room is just 4 simple steps away
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative text-center group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl gradient-bg shadow-glow mb-6 transition-transform group-hover:scale-110">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute hidden lg:flex md:flex -top-2 right-24 h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
