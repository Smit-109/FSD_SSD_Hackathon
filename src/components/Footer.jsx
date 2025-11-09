import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Github, Twitter, Facebook } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-dark-900 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-2 rounded-xl">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">ModernLibrary</span>
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Your digital gateway to knowledge and entertainment. Discover, read, and manage your favorite books with our modern library system.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/books/all" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Browse Books
                                </Link>
                            </li>
                            <li>
                                <Link to="/favorites" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    My Favorites
                                </Link>
                            </li>
                            <li>
                                <Link to="/add-book" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Add Book
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Categories</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/books/fiction" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Fiction
                                </Link>
                            </li>
                            <li>
                                <Link to="/books/non-fiction" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Non-Fiction
                                </Link>
                            </li>
                            <li>
                                <Link to="/books/science" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Science
                                </Link>
                            </li>
                            <li>
                                <Link to="/books/technology" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                                    Technology
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-gray-300">
                                <Mail className="h-4 w-4 text-primary-400" />
                                <span>support@modernlibrary.com</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-300">
                                <Phone className="h-4 w-4 text-primary-400" />
                                <span>+91 6355094230</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-300">
                                <MapPin className="h-4 w-4 text-primary-400" />
                                <span>123 Library St,Ahmedabad</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} ModernLibrary. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/contact" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;