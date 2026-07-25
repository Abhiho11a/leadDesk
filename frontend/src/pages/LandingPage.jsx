import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const budgetOptions = [
  { value: "", label: "Select a range" },
  { value: "<1k", label: "<$1k" },
  { value: "1k-5k", label: "$1k-$5k" },
  { value: "5k-10k", label: "$5k-$10k" },
  { value: "10k+", label: "$10k+" }
];

export default function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', budgetRange: '', message: '' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const formRef = useRef(null);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Name is required';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
    } else if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) error = 'Invalid email address';
    } else if (name === 'budgetRange') {
      if (!value) error = 'Please select a budget range';
    } else if (name === 'message') {
      if (!value.trim()) error = 'Message is required';
      else if (value.length > 1000) error = 'Message cannot exceed 1000 characters';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerErrors(prev => ({ ...prev, [name]: '' }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  useEffect(() => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
  }, []); // Run once to populate initial empty errors for disabled button logic, though not strict

  const isValid = Object.values(errors).every(err => !err) && Object.values(formData).every(val => val !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, budgetRange: true, message: true });
    
    let currentErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) currentErrors[key] = err;
    });
    setErrors(currentErrors);

    if (Object.keys(currentErrors).some(k => currentErrors[k])) return;

    setIsSubmitting(true);
    setServerErrors({});

    try {
      await api.post('/leads', formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', budgetRange: '', message: '' });
      setTouched({});
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      if (err.data) {
        setServerErrors(err.data);
      } else {
        setServerErrors({ general: 'Something went wrong. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white" />
          
          <div className="relative z-10 max-w-3xl text-center space-y-8 animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
              Capture Leads <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">Effortlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Supercharge your pipeline with a beautifully simple, high-converting capture tool. Stop letting potential clients slip through the cracks.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-600 text-white px-8 py-4 rounded-full font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all duration-300"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section ref={formRef} className="py-24 px-6 bg-gray-50 flex justify-center">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Let's Connect</h2>
              <p className="text-gray-500">Fill out the form below and we'll be in touch shortly.</p>
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in space-y-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">We'll be in touch!</h3>
                <p className="text-gray-500">Thank you for reaching out. We have received your message.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-brand-600 font-medium hover:text-brand-700 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {serverErrors.general && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{serverErrors.general}</p>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Jane Doe"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 transition-all focus:bg-white focus-ring",
                      (touched.name && errors.name) || serverErrors.name ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" : "border-gray-200"
                    )}
                  />
                  {((touched.name && errors.name) || serverErrors.name) && (
                    <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.name || serverErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="jane@example.com"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 transition-all focus:bg-white focus-ring",
                      (touched.email && errors.email) || serverErrors.email ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" : "border-gray-200"
                    )}
                  />
                  {((touched.email && errors.email) || serverErrors.email) && (
                    <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.email || serverErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700">Budget Range</label>
                  <select 
                    id="budgetRange" 
                    name="budgetRange" 
                    value={formData.budgetRange}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 transition-all focus:bg-white focus-ring appearance-none",
                      (touched.budgetRange && errors.budgetRange) || serverErrors.budgetRange ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" : "border-gray-200",
                      !formData.budgetRange && "text-gray-500"
                    )}
                  >
                    {budgetOptions.map(opt => (
                      <option key={opt.value} value={opt.value} disabled={!opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {((touched.budgetRange && errors.budgetRange) || serverErrors.budgetRange) && (
                    <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.budgetRange || serverErrors.budgetRange}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <span className={cn("text-xs", formData.message.length > 1000 ? "text-red-500 font-medium" : "text-gray-400")}>
                      {formData.message.length} / 1000
                    </span>
                  </div>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="How can we help you?"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 transition-all focus:bg-white focus-ring resize-none",
                      (touched.message && errors.message) || serverErrors.message ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" : "border-gray-200"
                    )}
                  />
                  {((touched.message && errors.message) || serverErrors.message) && (
                    <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.message || serverErrors.message}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={!isValid || isSubmitting}
                  className="w-full bg-brand-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 focus-ring shadow-lg shadow-brand-500/20"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t border-gray-200 bg-white">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}
