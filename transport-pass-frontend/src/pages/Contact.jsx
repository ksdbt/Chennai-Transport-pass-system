export default function ContactUs() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-24">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/contact-bg.jpg)' }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl mb-8">We'd love to hear from you! Reach out with any questions or feedback.</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-green-800 mb-6">Get in Touch</h2>
        <form className="max-w-lg mx-auto">
          <div className="mb-4">
            <input
              type="text"
              name="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              placeholder="Your Email"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="message"
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              placeholder="Your Message"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
