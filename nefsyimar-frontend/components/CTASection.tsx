import Link from 'next/link'
import { ArrowRight, Heart, Phone, Mail } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <div className="memorial-card rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight text-glow">
                Start Your Memorial Journey
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                Create a lasting tribute that honors your loved one's memory and brings comfort to family and friends.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  href="/memorials/create"
                  className="w-full sm:w-auto group bg-white text-black hover:bg-gray-100 px-10 py-4 rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] flex items-center justify-center space-x-2"
                >
                  <span>Create Memorial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white px-10 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Get Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Need Help */}
          <div className="memorial-card p-8 rounded-3xl hover:bg-white/5 transition-colors group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500/50 transition-colors">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Need Help?</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Our compassionate support team is here to guide you through creating your memorial.
            </p>
            <div className="space-y-3 text-gray-300 font-mono text-sm">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>+251 911 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Available 24/7</span>
              </div>
            </div>
          </div>

          {/* Email Support */}
          <div className="memorial-card p-8 rounded-3xl hover:bg-white/5 transition-colors group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:border-green-500/50 transition-colors">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Email Support</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Reach out to us for detailed assistance or technical questions.
            </p>
            <div className="space-y-3 text-gray-300 font-mono text-sm">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>support@nefsyimar.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Response within 2 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-24">
          <p className="text-gray-500 text-sm tracking-[0.2em] uppercase font-medium">
            "In memory, love lives forever. In community, healing begins."
          </p>
        </div>
      </div>
    </section>
  )
}
