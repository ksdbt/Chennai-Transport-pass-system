export default function Footer() {
  //const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-200 mt-8">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">🚍 Chennai Transport</h3>
            <p className="text-gray-400">Modern, secure, and convenient transport solutions for the city of Chennai.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/signup" className="hover:text-white">Sign Up</a></li>
              <li><a href="/login" className="hover:text-white">Sign In</a></li>
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Transport Modes</h4>
            <ul className="space-y-2 text-gray-400">
              <li>🚌 Bus Network</li>
              <li>🚆 Train Services</li>
              <li>🚇 Metro Rail</li>
              <li>🎫 All-in-One Pass</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 help@chennaitransport.com</li>
              <li>📞 1800-123-4567</li>
              <li>💬 Live Chat</li>
              <li>📱 Mobile App</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>© 2025 Public Transport Pass System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
