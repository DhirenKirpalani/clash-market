import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.contactId.trim()) {
      toast({
        title: "Contact ID Required",
        description: "Please enter your Telegram or Discord ID.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Request Received!",
        description: "We'll notify you when early access is available.",
      });
      setFormData({
        name: "",
        email: "",
        contactId: ""
      });
      setIsSubmitting(false);
    }, 1500);
  };
  
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] text-white overflow-hidden relative">
        {/* Background gradient in Hyperliquid style */}
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: "linear-gradient(165deg, #012619 0%, #033d2d 50%, #003020 100%)" }}>
        {/* Animated main blob shape */}
        <div className="absolute top-[5%] left-[20%] right-[20%] w-[60%] h-[60%] rounded-full bg-[#05967d]/30 blur-[120px] animate-pulse-slow"></div>
        
        {/* Animated secondary blob shapes with different animation durations */}
        <motion.div 
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ 
            opacity: [0.7, 0.5, 0.7],
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 15,
            ease: "easeInOut" 
          }}
          className="absolute -top-[150px] -left-[150px] w-[500px] h-[500px] rounded-full bg-[#04d9b2]/20 blur-[100px]"
        />
        
        <motion.div 
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ 
            opacity: [0.6, 0.4, 0.6],
            scale: [1, 1.15, 1],
            x: [0, -30, 0], 
            y: [0, 15, 0]
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 18,
            ease: "easeInOut" 
          }}
          className="absolute top-[30%] -right-[150px] w-[450px] h-[450px] rounded-full bg-[#03b898]/15 blur-[120px]"
        />
        
        <motion.div 
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ 
            opacity: [0.5, 0.3, 0.5],
            scale: [1, 1.1, 1],
            x: [0, 15, 0], 
            y: [0, -10, 0]
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 12,
            ease: "easeInOut" 
          }}
          className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[#029e82]/20 blur-[80px]"
        />

        {/* Logo-like shape in the center with subtle rotation animation */}
        <motion.div 
          initial={{ rotate: 45, opacity: 0.5 }}
          animate={{ 
            rotate: [45, 50, 45], 
            opacity: [0.5, 0.6, 0.5]  
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut" 
          }}
          className="absolute top-[20%] left-[35%] right-[35%] w-[30%] h-[20%] bg-[#05d6a9]/30 blur-[50px] rounded-[50%]"
        />
        
        <motion.div 
          initial={{ rotate: -45, opacity: 0.5 }}
          animate={{ 
            rotate: [-45, -40, -45], 
            opacity: [0.5, 0.6, 0.5] 
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
          className="absolute top-[20%] left-[35%] right-[35%] w-[30%] h-[20%] bg-[#05d6a9]/30 blur-[50px] rounded-[50%]"
        />
      </div>
      
      {/* Main content */}
      <motion.div 
        className="container mx-auto px-4 py-16 md:py-24 flex-grow flex flex-col justify-center items-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          variants={itemVariants}
        >
          <motion.div 
            className="mb-4 inline-flex justify-center items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#05d6a9] via-[#02735e] to-[#05d6a9] backdrop-blur-md border border-[#05d6a9]/20"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-sm font-medium tracking-wide">COMING SOON</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-sans tracking-tight"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#05d6a9] via-white to-[#05d6a9]">
              THE FUTURE OF CRYPTO
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#04eac2] to-[#04eac2]">
              GAMING IS HERE
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Experience the most advanced crypto trading game with real-time markets, 
            competitive gameplay, and cutting-edge technology. Request early access now.
          </motion.p>
          
          <motion.form 
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-lg mx-auto w-full backdrop-blur-md bg-[#012619]/50 rounded-xl border border-[#05d6a9]/30 p-6 shadow-lg"
            variants={itemVariants}
          >
            <div className="group relative">
              <Input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/30 text-white border-0 rounded-xl py-6 px-4 focus:ring-2 focus:ring-[#05d6a9]/50 placeholder:text-white/50 shadow-inner"
              />
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#05d6a9] to-[#02735e] opacity-40 -z-10 blur-[2px] group-hover:opacity-60 transition-opacity"></div>
            </div>
            
            <div className="group relative">
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black/30 text-white border-0 rounded-xl py-6 px-4 focus:ring-2 focus:ring-[#05d6a9]/50 placeholder:text-white/50 shadow-inner"
              />
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#05d6a9] to-[#02735e] opacity-40 -z-10 blur-[2px] group-hover:opacity-60 transition-opacity"></div>
            </div>
            
            <div className="group relative">
              <Input
                type="text"
                name="contactId"
                placeholder="Your Telegram/Discord ID"
                value={formData.contactId}
                onChange={handleChange}
                className="w-full bg-black/30 text-white border-0 rounded-xl py-6 px-4 focus:ring-2 focus:ring-[#05d6a9]/50 placeholder:text-white/50 shadow-inner"
              />
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#05d6a9] to-[#02735e] opacity-40 -z-10 blur-[2px] group-hover:opacity-60 transition-opacity"></div>
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#05d6a9] hover:bg-[#04eac2] text-[#012619] font-semibold py-6 px-8 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(5,214,169,0.5)] hover:shadow-[0_0_25px_rgba(5,214,169,0.7)]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Processing...
                </div>
              ) : (
                "Request Early Access"
              )}
            </Button>
          </motion.form>
          
          <motion.div 
            className="mt-12 text-white/60 text-sm"
            variants={itemVariants}
          >
            <p>Join the hyper-performant blockchain ecosystem designed for all finance.</p>
          </motion.div>
        </motion.div>
        
        {/* Features section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-4xl"
          variants={itemVariants}
        >
          <motion.div 
            className="backdrop-blur-md bg-[#012619]/70 rounded-xl border border-[#05d6a9]/20 p-6 hover:border-[#05d6a9]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(5,214,169,0.2)]" 
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            variants={itemVariants}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#05d6a9] to-[#02735e]/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(5,214,169,0.4)]">
              <i className="ri-exchange-line text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Start Trading</h3>
            <p className="text-white/70">Trade perpetuals with deep liquidity and low fees</p>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-md bg-[#012619]/70 rounded-xl border border-[#05d6a9]/20 p-6 hover:border-[#05d6a9]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(5,214,169,0.2)]" 
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            variants={itemVariants}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#04eac2] to-[#02735e]/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(5,214,169,0.4)]">
              <i className="ri-building-line text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Start Building</h3>
            <p className="text-white/70">Build on a low latency blockchain with superior throughput</p>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-md bg-[#012619]/70 rounded-xl border border-[#05d6a9]/20 p-6 hover:border-[#05d6a9]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(5,214,169,0.2)]" 
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            variants={itemVariants}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03b898] to-[#02735e]/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(5,214,169,0.4)]">
              <i className="ri-pie-chart-line text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">View Stats</h3>
            <p className="text-white/70">Explore ecosystem metrics and trading statistics</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
