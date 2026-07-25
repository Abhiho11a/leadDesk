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
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500/30 selection:text-white bg-slate-900 relative">
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 mesh-bg z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-brand-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-[30rem] h-[30rem] bg-violet-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <main className="flex-grow relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <section className="px-6 pt-32 pb-16 md:pt-40 md:pb-24 w-full flex flex-col items-center text-center">
          <div className="max-w-4xl space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-200 text-sm font-medium backdrop-blur-md mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Modern Lead Capture
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Grow Your Pipeline <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-fuchsia-400 to-brand-300 bg-[length:200%_auto] animate-pulse">Effortlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Supercharge your conversions with a beautifully simple capture tool that clients actually want to fill out.
            </p>
            <div className="pt-6">
              <button 
                onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="bg-brand-500 text-white px-8 py-4 rounded-full font-semibold shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_60px_-15px_rgba(217,70,239,0.7)] hover:-translate-y-1 hover:bg-brand-400 transition-all duration-300"
              >
                Start Capturing Now
              </button>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section ref={formRef} className="w-full px-4 pb-32 flex justify-center scroll-mt-20">
          <div className="max-w-lg w-full glass-card rounded-[2rem] p-8 md:p-12 relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 rounded-[2rem] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">Let's Connect</h2>
                <p className="text-slate-300">Fill out the form below and we'll be in touch shortly.</p>
              </div>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in space-y-4">
                  <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-2 animate-float">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">We'll be in touch!</h3>
                  <p className="text-slate-300">Thank you for reaching out. We have received your message.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-brand-300 font-medium hover:text-brand-200 transition-colors underline underline-offset-4 decoration-brand-300/30"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {serverErrors.general && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl flex items-start gap-3 animate-fade-in">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                      <p className="text-sm font-medium">{serverErrors.general}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-200 ml-1">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Jane Doe"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl glass-input focus-ring transition-all duration-300 outline-none",
                        (touched.name && errors.name) || serverErrors.name ? "border-red-400/50 focus:ring-red-500/50 focus:border-red-500 bg-red-500/10" : ""
                      )}
                    />
                    {((touched.name && errors.name) || serverErrors.name) && (
                      <p className="text-sm text-red-400 mt-1 ml-1 animate-fade-in">{errors.name || serverErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-200 ml-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="jane@example.com"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl glass-input focus-ring transition-all duration-300 outline-none",
                        (touched.email && errors.email) || serverErrors.email ? "border-red-400/50 focus:ring-red-500/50 focus:border-red-500 bg-red-500/10" : ""
                      )}
                    />
                    {((touched.email && errors.email) || serverErrors.email) && (
                      <p className="text-sm text-red-400 mt-1 ml-1 animate-fade-in">{errors.email || serverErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="budgetRange" className="block text-sm font-medium text-slate-200 ml-1">Budget Range</label>
                    <div className="relative">
                      <select 
                        id="budgetRange" 
                        name="budgetRange" 
                        value={formData.budgetRange}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "w-full px-5 py-4 rounded-2xl glass-input focus-ring transition-all duration-300 outline-none appearance-none",
                          (touched.budgetRange && errors.budgetRange) || serverErrors.budgetRange ? "border-red-400/50 focus:ring-red-500/50 focus:border-red-500 bg-red-500/10" : "",
                          !formData.budgetRange && "text-slate-400"
                        )}
                      >
                        {budgetOptions.map(opt => (
                          <option key={opt.value} value={opt.value} disabled={!opt.value} className="bg-slate-800 text-white">{opt.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {((touched.budgetRange && errors.budgetRange) || serverErrors.budgetRange) && (
                      <p className="text-sm text-red-400 mt-1 ml-1 animate-fade-in">{errors.budgetRange || serverErrors.budgetRange}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end ml-1">
                      <label htmlFor="message" className="block text-sm font-medium text-slate-200">Message</label>
                      <span className={cn("text-xs font-medium", formData.message.length > 1000 ? "text-red-400" : "text-slate-400")}>
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
                      placeholder="Tell us about your project..."
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl glass-input focus-ring transition-all duration-300 outline-none resize-none",
                        (touched.message && errors.message) || serverErrors.message ? "border-red-400/50 focus:ring-red-500/50 focus:border-red-500 bg-red-500/10" : ""
                      )}
                    />
                    {((touched.message && errors.message) || serverErrors.message) && (
                      <p className="text-sm text-red-400 mt-1 ml-1 animate-fade-in">{errors.message || serverErrors.message}</p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!isValid || isSubmitting}
                    className="w-full bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none focus-ring mt-4"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-8 text-center border-t border-white/10 bg-slate-900/50 backdrop-blur-md">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}
