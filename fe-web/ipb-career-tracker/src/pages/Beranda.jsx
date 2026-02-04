import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { OPPORTUNITIES, COMPANIES } from '../data/mockData';
import { MapPin, DollarSign, ArrowRight } from 'lucide-react';

export function Beranda() {
  const recentJobs = OPPORTUNITIES.slice(0, 3);
  // Repeat companies to simulate scrolling effect if needed, but for now just use all
  const allCompanies = [...COMPANIES, ...COMPANIES]; 

  return (
    <>
      <section className="relative bg-[#bde8f5]/20 pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
         <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-highlight/40 blur-3xl opacity-60"></div>
         <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl opacity-60"></div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl lg:mx-0">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl font-sans text-balance">
              Growing Talent,<br/>Shaping Futures.
            </h1>
            <p className="mt-6 text-lg leading-8 text-secondary">
              A thoughtful transition from university to professional life. 
              Find internships, jobs, and scholarships, and organize your applications in one personal workspace.
            </p>
            <div className="mt-8 flex items-center gap-x-6">
              <Button to="/lowongan" variant="primary" size="lg">
                Explore Opportunities
              </Button>
              <Link to="/panduan" className="text-sm font-semibold leading-6 text-primary hover:text-accent transition-colors flex items-center gap-1">
                Read the Guides <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-4">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-primary">Latest Opportunities</h2>
                <p className="mt-2 text-secondary">Curated openings for students and fresh graduates.</p>
            </div>
            <Link to="/lowongan" className="text-sm font-medium text-primary hover:text-accent mb-1 flex items-center gap-1">
                View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
                <Card key={job.id} className="hover:border-primary/30 transition-colors group">
                    <CardBody className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-medium text-lg text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">{job.title}</h3>
                                <p className="text-secondary text-sm">{COMPANIES.find(c => c.id === job.companyId)?.name}</p>
                            </div>
                            <Badge variant={job.type === 'Internship' ? 'info' : job.type === 'Scholarship' ? 'success' : 'neutral'}>
                                {job.type}
                            </Badge>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm text-secondary gap-2">
                                <MapPin size={16} className="text-accent" />
                                {job.location}
                            </div>
                            <div className="flex items-center text-sm text-secondary gap-2">
                                <DollarSign size={16} className="text-accent" />
                                {job.salary}
                            </div>
                        </div>
                        <Button to={`/lowongan/${job.id}`} variant="outline" className="w-full text-xs py-2 bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-300">
                            Details
                        </Button>
                    </CardBody>
                </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#0f2854] to-[#727272] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <h2 className="text-2xl font-semibold tracking-tight text-white/90 text-center mb-12">
                Join 50+ Partner Companies
            </h2>
            
            {/* Scrolling Banner Implementation */}
            <div className="flex overflow-hidden space-x-12 group">
                <div className="flex space-x-12 animate-scroll">
                    {allCompanies.map((company, index) => (
                         <div key={`${company.id}-${index}`} className="flex items-center justify-center min-w-[150px] opacity-70 hover:opacity-100 transition-opacity">
                            <Link to={`/perusahaan/${company.id}`} className="flex flex-col items-center">
                                <div className="h-16 w-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/50 text-xs font-bold mb-2">
                                    Logo
                                </div>
                                <span className="text-white/80 font-medium text-sm">{company.name}</span>
                            </Link>
                         </div>
                    ))}
                </div>
            </div>
        </div>
      </section>
    </>
  );
}
