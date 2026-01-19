"use client";

import BannerHero from "@/components/BannerHero/BannerHero";
import { Titleh1 } from "@/components/Texts/Titleh1";
import Image from "next/image";
import InstagramEmbed from "@/components/RedesSociales/InstagramEmbed";
import { cubicBezier, motion } from "framer-motion";
import {
  Instagram,
  Heart,
  Users,
  TrendingUp,
  Facebook,
  Youtube,
} from "lucide-react";
import { Stats } from "@/components/Stats/Stats";
import PDFViewer from "@/components/RedesSociales/PDFViewer";
import { Separator } from "@/components/ui/separator";

const RedesSocialesPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: cubicBezier(0.25, 0.1, 0.25, 1),
      },
    },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: cubicBezier(0.25, 0.1, 0.25, 1),
      },
    },
  };

  const stats = [
    { icon: Users, label: "Muertes al año en el pais", value: "40000" },
    { icon: Heart, label: "Fuera del ambito hospitalario", value: "70%" },
    {
      icon: TrendingUp,
      label:
        "Probabilidad de sobrevida. RCP + DEA dentro de los primeros 4 minutos",
      value: "+70%",
    },
  ];

  return (
    <div className="flex flex-col gap-0 relative overflow-hidden">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <BannerHero
          src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923390/redes_n5ncln.jpg"
          srcMobile="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923390/redes_n5ncln.jpg"
          title="Redes Sociales"
          description="En esta sección encontrarás todo sobre nuestras redes sociales: síguenos y entérate de cursos, tips y novedades en RCP."
        />
      </motion.div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 pointer-events-none" />

      {/* Stats Section */}
      <Stats stats={stats} />

      <div className="relative px-4 md:px-0 container mx-auto flex flex-col gap-16 py-16">
        {/* Main Title Section */}
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Titleh1 title="Con la RCP NO." />
          </motion.div>
          <motion.p
            className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Descubre nuestro contenido educativo y únete a nuestra comunidad
            comprometida con salvar vidas
          </motion.p>
        </motion.div>

        {/* Instagram Posts Grid */}
        <motion.section
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Reel
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/reel/CoalPgtDGhL/?igsh=a2pldzZtZHpxejJv" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/CnHaZbJumgG/?igsh=MWZvdHR5MHR5MXlxOA==" />
                </div>
              </div>
            </motion.div>
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/Cywu2HOMvv0/" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Reel
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/DK15t9tsDCP" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <Image
                    src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747883997/rcp-no_gdwfiv.jpg"
                    width={800}
                    height={600}
                    alt="RCP Campaign"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Reel
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/CymHUYNKxVY/" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/CxwQYf9sE9V/?img_index=5" />
                </div>
              </div>
            </motion.div>
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/CxosKarMmnB/" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/Cw3k-YLsDvW/" />
                </div>
              </div>
            </motion.div>
            <motion.div
              className="group"
              variants={scaleVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-800">
                    Instagram Post
                  </span>
                </div>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <InstagramEmbed url="https://www.instagram.com/p/CvTAJkEPYyl/" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <Separator className="bg-gray-300" />

        <div className="flex justify-center gap-10 flex-col md:flex-row">
          {/* Celebrity Section */}
          <motion.section
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="relative inline-block"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-20 scale-110" />
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Colaboración Especial
                  </span>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  ¡Julián Weich también lucha contra la muerte súbita!
                </h2>
              </div>
            </motion.div>

            <motion.div className="mt-12" variants={scaleVariants}>
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-2xl opacity-20 scale-105" />
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Instagram className="w-6 h-6 text-pink-500" />
                      <span className="font-semibold text-gray-800">
                        Colaboración Especial
                      </span>
                    </div>
                    <div className="aspect-full overflow-hidden rounded-xl">
                      <InstagramEmbed url="https://www.instagram.com/p/CSzQYtXgY2t/" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Law Section */}
          <motion.section
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="relative inline-block mb-12"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-500 rounded-2xl blur-xl opacity-20 scale-110" />
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Marco Legal
                  </span>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  El Compromiso continúa Ley 27.159
                </h2>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  Comprometidos con el cumplimiento de la legislación vigente en
                  materia de RCP
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative max-w-lg mx-auto"
              variants={scaleVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl blur-2xl opacity-20 scale-105" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Instagram className="w-6 h-6 text-pink-500" />
                    <span className="font-semibold text-gray-800">
                      Información Legal
                    </span>
                  </div>
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <InstagramEmbed url="https://www.instagram.com/p/CmEwMU2r6fF/?utm_source=ig_embed&amp;utm_campaign=loading" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
        {/* PDf nativo */}
        <PDFViewer />
        {/* <div className="md:relative   md:max-w-2xl md:mx-auto">
          <iframe
            className="w-full md:w-[500px]"
            src="/post-ig.pdf"
            height="800px"
            style={{ border: "none" }}
          ></iframe>
        </div> */}

        {/* Call to Action */}
        <motion.section
          className="text-center py-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary-to-r from-[primary] to-[secondary}] rounded-3xl blur-3xl opacity-10 scale-110" />
            <div className="relative bg-gradient-to-r from-primary to-red-600 rounded-3xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">
                ¡Seguinos en Nuestras Redes!
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Mantente actualizado con nuestros últimos contenidos educativos
                y unite a nuestra comunidad
              </p>
              <div className="flex flex-col  md:flex-row items-center gap-5 justify-center">
                <motion.button
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    window.open(
                      "https://www.instagram.com/argentinareanimaac/",
                      "_blank",
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-6 h-6" />
                    Seguir en Instagram
                  </div>
                </motion.button>
                <motion.button
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/profile.php?id=100087258240312",
                      "_blank",
                    )
                  }
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <Facebook className="w-6 h-6" />
                    Seguir en Facebook
                  </div>
                </motion.button>

                <motion.button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/channel/UCUe7YAlQawPP9VHg_1B172w",
                      "_blank",
                    )
                  }
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <Youtube className="w-6 h-6" />
                    Seguir en Youtube
                  </div>
                </motion.button>
                <motion.button
                  onClick={() =>
                    window.open(
                      "https://www.tiktok.com/@argentina.reanima",
                      "_blank",
                    )
                  }
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="20"
                      height="20"
                      className="fill-current -mb-2"
                    >
                      <path d="M208.005 78.284a78.366 78.366 0 0 1-43.999-13.224v74.941a63.96 63.96 0 1 1-63.96-63.96c1.792 0 3.56.088 5.3.255v35.994a28.06 28.06 0 1 0 28.06 28.06V0h33.457a44.823 44.823 0 0 0 6.435 22.847c7.934 13.285 22.347 22.176 38.707 22.947v32.49z" />
                    </svg>
                    Seguir en TikTok
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default RedesSocialesPage;
