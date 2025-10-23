import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/your-image.jpg)' }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl mb-8">Learn more about our mission, values, and team!</p>
          <button className="bg-white text-blue-800 px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-100 transition-all duration-300">
            Get in Touch
          </button>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-blue-800 mb-6">Our Story</h2>
        <p className="text-lg text-gray-700 mb-6">
          We started with a simple vision: to improve transportation in Chennai. Our journey has been one of constant growth,
          learning, and dedication to delivering the best service to the people of this city. We strive to create a smarter,
          safer, and more sustainable future for urban mobility.
        </p>
        <p className="text-lg text-gray-700">
          Over the years, we've expanded our offerings, collaborated with transport agencies, and made it easier than ever for
          people to travel around the city. Together, we can continue to drive innovation for a better tomorrow.
        </p>
      </section>

      {/* Mission & Values Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-blue-800 mb-8">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Mission</h3>
              <p className="text-gray-700">
                Our mission is to create an accessible and efficient public transport experience for all users in Chennai,
                making mobility seamless and hassle-free.
              </p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Innovation</h3>
              <p className="text-gray-700">
                We constantly innovate, embracing new technologies to improve travel safety, comfort, and sustainability in the
                transportation sector.
              </p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Sustainability</h3>
              <p className="text-gray-700">
                We are committed to minimizing our environmental impact and promoting sustainable travel options that benefit
                both the environment and the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-blue-800 mb-8">Meet the Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <img src="/team-member1.jpg" alt="Team Member" className="w-32 h-32 mx-auto rounded-full mb-4" />
            <h3 className="text-xl font-semibold text-blue-800">John Doe</h3>
            <p className="text-gray-700">Founder & CEO</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <img src="/team-member2.jpg" alt="Team Member" className="w-32 h-32 mx-auto rounded-full mb-4" />
            <h3 className="text-xl font-semibold text-blue-800">Jane Smith</h3>
            <p className="text-gray-700">CTO</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <img src="/team-member3.jpg" alt="Team Member" className="w-32 h-32 mx-auto rounded-full mb-4" />
            <h3 className="text-xl font-semibold text-blue-800">Emily Johnson</h3>
            <p className="text-gray-700">Head of Marketing</p>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Want to Know More?</h2>
          <p className="text-lg mb-6">Feel free to reach out to us with any questions or inquiries. We are here to help!</p>
          <Link
            to="/contact"
            className="bg-white text-blue-800 px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-100 transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
