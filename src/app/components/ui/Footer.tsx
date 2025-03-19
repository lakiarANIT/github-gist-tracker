export default function Footer() {
    return (
      <footer className="bg-purple-900 text-white py-2 px-4 sm:py-3 sm:px-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm">
          {/* Copyright */}
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} GitHub Gist Tracker
          </p>
  
          {/* Links */}
          <div className="flex gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition-colors"
            >
              GitHub
            </a>
            <a href="/about" className="hover:text-purple-300 transition-colors">
              About
            </a>
          </div>
        </div>
      </footer>
    );
  }
  