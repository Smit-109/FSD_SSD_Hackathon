import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Upload, X, CheckCircle, AlertCircle, BookOpen, Image as ImageIcon } from "lucide-react";

function AddBookForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    author: "",
    description: "",
    category: "",
    genre: "",
    releasedYear: "",
    rating: "",
    country: "",
    publisher: "",
    isbn: "",
    pageCount: "",
    language: "English",
  });

  const [files, setFiles] = useState({
    bookCover: null,
    pdf: null,
  });

  const [previews, setPreviews] = useState({
    bookCover: null,
    pdf: null,
  });

  const coverImageInput = useRef();
  const pdfInput = useRef();
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch(`${baseUrl}/api/v1/categories/all`);
      const categoriesRes = await res.json();
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleFileChange(e) {
    const { name, files: fileList } = e.target;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    
    // Validate and preview files
    if (name === "bookCover") {
      if (!file.type.startsWith("image")) {
        toast.error("Book Cover must be an image file!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Book Cover must be less than 5MB!");
        return;
      }
      
      setFiles(prev => ({ ...prev, bookCover: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, bookCover: e.target.result }));
      };
      reader.readAsDataURL(file);
    } 
    else if (name === "pdf") {
      if (file.type !== "application/pdf") {
        toast.error("File must be a PDF!");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("PDF file must be less than 50MB!");
        return;
      }
      
      setFiles(prev => ({ ...prev, pdf: file }));
      setPreviews(prev => ({ ...prev, pdf: file.name }));
    }
  }

  function removeFile(fileType) {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    setPreviews(prev => ({ ...prev, [fileType]: null }));
    
    if (fileType === "bookCover" && coverImageInput.current) {
      coverImageInput.current.value = "";
    } else if (fileType === "pdf" && pdfInput.current) {
      pdfInput.current.value = "";
    }
  }

  async function validateStep(stepNum) {
    switch(stepNum) {
      case 1: {
        if (!formData.title.trim()) {
          toast.error("Book Title is required!");
          return false;
        }
        if (!formData.author.trim()) {
          toast.error("Author Name is required!");
          return false;
        }
        if (!formData.description.trim()) {
          toast.error("Description is required!");
          return false;
        }
        if (!formData.category) {
          toast.error("Category is required!");
          return false;
        }
        return true;
      }
      case 2: {
        if (!formData.releasedYear) {
          toast.error("Published Year is required!");
          return false;
        }
        const year = parseInt(formData.releasedYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1800 || year > currentYear) {
          toast.error(`Year must be between 1800 and ${currentYear}!`);
          return false;
        }
        if (!formData.country.trim()) {
          toast.error("Country is required!");
          return false;
        }
        if (!formData.language.trim()) {
          toast.error("Language is required!");
          return false;
        }
        return true;
      }
      case 3: {
        if (!files.bookCover) {
          toast.error("Book Cover Image is required!");
          return false;
        }
        if (!files.pdf) {
          toast.error("Book PDF is required!");
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  }

  async function handleNextStep() {
    if (await validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevStep() {
    setCurrentStep(currentStep - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!await validateStep(3)) return;

    const finalRating = formData.rating ? parseFloat(formData.rating) : 0;
    if (isNaN(finalRating) || finalRating < 0 || finalRating > 5) {
      toast.error("Rating must be between 0 and 5!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("subtitle", formData.subtitle);
    data.append("author", formData.author);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("genre", formData.genre || formData.category);
    data.append("releasedYear", formData.releasedYear);
    data.append("rating", finalRating);
    data.append("country", formData.country);
    data.append("publisher", formData.publisher);
    data.append("isbn", formData.isbn);
    data.append("pageCount", formData.pageCount);
    data.append("language", formData.language);
    data.append("bookCover", files.bookCover);
    data.append("pdf", files.pdf);

    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/v1/books/add`, {
        method: "POST",
        body: data,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message || 'Failed to add book');
      }

      toast.success("Book added successfully!");
      
      // Reset form
      setFormData({
        title: "",
        subtitle: "",
        author: "",
        description: "",
        category: "",
        genre: "",
        releasedYear: "",
        rating: "",
        country: "",
        publisher: "",
        isbn: "",
        pageCount: "",
        language: "English",
      });
      setFiles({ bookCover: null, pdf: null });
      setPreviews({ bookCover: null, pdf: null });
      setCurrentStep(1);

      setTimeout(() => navigate('/admin'), 1000);
    } catch (error) {
      toast.error(error.message || "Failed to add book. Please try again.");
      console.error("Error adding book:", error);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { number: 1, title: "Basic Info", description: "Title, Author, Description" },
    { number: 2, title: "Details", description: "Publishing info & metadata" },
    { number: 3, title: "Files", description: "Cover & PDF upload" },
    { number: 4, title: "Review", description: "Confirm & publish" },
  ];

  return (
    <div className="min-h-screen bg-mesh py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-2">Add New Book</h1>
          <p className="text-dark-600">Fill in the details to add a book to your library</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex flex-col items-center flex-1`}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step.number < currentStep
                        ? "bg-green-500 text-white"
                        : step.number === currentStep
                        ? "bg-primary-600 text-white ring-4 ring-primary-100"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.number < currentStep ? <CheckCircle className="h-6 w-6" /> : step.number}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${step.number <= currentStep ? "text-dark-900" : "text-gray-500"}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                      step.number < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6">Book Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter the main title of the book"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Subtitle <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Enter subtitle if any"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author's full name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Write a brief description about the book"
                    rows="5"
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Publishing Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6">Publishing Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-2">
                      Published Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="releasedYear"
                      value={formData.releasedYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2023"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-2">
                      Origin Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., United States"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Publisher <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    placeholder="Enter publisher name"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-2">
                      ISBN <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      placeholder="e.g., 978-0-123456-78-9"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-2">
                      Page Count <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      name="pageCount"
                      value={formData.pageCount}
                      onChange={handleInputChange}
                      placeholder="e.g., 320"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-2">
                      Language <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="e.g., English"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-2">
                      Genre <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      placeholder="e.g., Fiction, Mystery"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Rating <span className="text-gray-400 text-xs">(0-5, Optional)</span>
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="e.g., 4.5"
                    min="0"
                    max="5"
                    step="0.1"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 3: File Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6">Upload Files</h2>

                {/* Book Cover */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-3">
                    Book Cover Image <span className="text-red-500">*</span>
                  </label>
                  
                  {previews.bookCover ? (
                    <div className="relative inline-block">
                      <img
                        src={previews.bookCover}
                        alt="Book Cover Preview"
                        className="h-48 rounded-lg shadow-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile("bookCover")}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <div className="mt-2 flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Cover image ready</span>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition-colors">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark-900">Click to upload book cover</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP (max 5MB)</p>
                      <input
                        ref={coverImageInput}
                        type="file"
                        name="bookCover"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-3">
                    Book PDF <span className="text-red-500">*</span>
                  </label>
                  
                  {previews.pdf ? (
                    <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-dark-900">{previews.pdf}</p>
                          <p className="text-sm text-gray-600">{(files.pdf.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("pdf")}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark-900">Click to upload PDF</p>
                      <p className="text-xs text-gray-500 mt-1">PDF files only (max 50MB)</p>
                      <input
                        ref={pdfInput}
                        type="file"
                        name="pdf"
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-dark-900">Important</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Ensure your PDF is properly formatted and the cover image clearly represents your book.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6">Review Book Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {/* Cover Preview */}
                  {previews.bookCover && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cover</p>
                      <img
                        src={previews.bookCover}
                        alt="Book Cover"
                        className="h-40 rounded-lg shadow-md object-cover"
                      />
                    </div>
                  )}

                  {/* Summary */}
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</p>
                      <p className="text-lg font-semibold text-dark-900">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</p>
                      <p className="text-dark-700">{formData.author}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</p>
                      <p className="text-dark-700">{formData.category}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</p>
                    <p className="text-dark-900 font-medium">{formData.releasedYear}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</p>
                    <p className="text-dark-900 font-medium">{formData.country}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Language</p>
                    <p className="text-dark-900 font-medium">{formData.language}</p>
                  </div>
                  {formData.publisher && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Publisher</p>
                      <p className="text-dark-900 font-medium">{formData.publisher}</p>
                    </div>
                  )}
                  {formData.pageCount && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pages</p>
                      <p className="text-dark-900 font-medium">{formData.pageCount}</p>
                    </div>
                  )}
                  {formData.rating && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</p>
                      <p className="text-dark-900 font-medium">⭐ {formData.rating}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-dark-700 bg-gray-50 p-4 rounded-lg">{formData.description}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-dark-900">Ready to publish</p>
                    <p className="text-sm text-gray-600 mt-1">
                      All information looks good. Click "Publish Book" to add this book to the library.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-gray-300 text-dark-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              
              <div className="flex-1"></div>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  )}
                  Publish Book
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddBookForm;
