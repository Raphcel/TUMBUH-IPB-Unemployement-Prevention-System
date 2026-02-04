import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { OPPORTUNITIES, COMPANIES } from '../data/mockData';
import { ArrowLeft, MapPin, DollarSign, Calendar, Clock, Briefcase, Lock, X } from 'lucide-react';

export function DetailLowongan() {
  const { id } = useParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const job = OPPORTUNITIES.find(o => o.id === parseInt(id));
  
  if (!job) {
    return <div className="py-20 text-center text-secondary">Opportunity not found</div>;
  }

  const company = COMPANIES.find(c => c.id === job.companyId);

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10 animate-fade-in-up">
                <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-primary" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-primary">Login Required</h3>
                    <p className="text-secondary mt-2">You need to sign in to apply for this position.</p>
                </div>
                <div className="space-y-3">
                    <Button to="/login" className="w-full justify-center">Log In</Button>
                    <Button to="/register" variant="outline" className="w-full justify-center">Create Account</Button>
                </div>
            </div>
        </div>
      )}

      <div className="bg-primary py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
            <Link to="/lowongan" className="text-primary-foreground/70 hover:text-white mb-6 inline-flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} /> Back to Opportunities
            </Link>
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                     <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 text-primary-foreground/80">
                         <span className="font-medium text-white">{company.name}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-accent hover:bg-accent/90 text-primary font-semibold w-full md:w-auto shadow-lg shadow-accent/20 border-none"
                >
                    Apply Now
                </Button>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Card className="shadow-lg border-gray-100/50">
                    <CardBody className="p-8">
                        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-accent" /> Job Description
                        </h2>
                        <p className="text-secondary whitespace-pre-line leading-relaxed">{job.description}</p>
                        
                        <h3 className="text-lg font-bold text-primary mt-8 mb-4">Requirements</h3>
                        <ul className="space-y-3">
                            {job.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-secondary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                    <span className="leading-relaxed">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="shadow-lg border-gray-100/50">
                    <CardBody className="p-6">
                        <h3 className="font-semibold text-primary mb-4 border-b border-gray-100 pb-2">Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Briefcase size={12} /> Job Type
                                </p>
                                <p className="font-medium text-gray-900">{job.type}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <DollarSign size={12} /> Salary
                                </p>
                                <p className="font-medium text-gray-900">{job.salary}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Calendar size={12} /> Deadline
                                </p>
                                <p className="font-medium text-gray-900">{job.deadline}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg border-gray-100/50">
                    <CardBody className="p-6">
                        <h3 className="font-semibold text-primary mb-4 border-b border-gray-100 pb-2">About Company</h3>
                        <p className="text-secondary text-sm mb-4 leading-relaxed line-clamp-4">{company.description}</p>
                        <Link to={`/perusahaan/${company.id}`} className="text-primary text-sm font-medium hover:text-accent transition-colors flex items-center gap-1">
                            View Company Profile &rarr;
                        </Link>
                    </CardBody>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
