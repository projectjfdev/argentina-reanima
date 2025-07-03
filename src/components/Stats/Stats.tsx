import { motion } from "framer-motion";

interface IStat {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}

export const Stats = ({ stats }: { stats: IStat[] }) => {
  return (
    <motion.section
      className="relative py-16 bg-gradient-to-r from-primary via-[#189cd8] to-secondary"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
