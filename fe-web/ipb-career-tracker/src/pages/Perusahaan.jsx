import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANIES } from '../data/mockData';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, Star, Award, MapPin } from 'lucide-react';

export function Perusahaan() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = COMPANIES.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
             <div>
                <h1 className="text-3xl font-semibold tracking-tight text-primary">Partner Companies</h1>
                <p className="mt-2 text-secondary text-lg">Connect with industry leaders and top employers.</p>
            </div>
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary/20" 
                    placeholder="Search by name or industry..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company, index) => (
            <Link key={company.id} to={`/perusahaan/${company.id}`} className="group h-full">
              <Card className="h-full hover:border-primary/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-white border-gray-100">
                 {/* Decorative background accent */}
                 <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gray-50 to-gray-100/50 -z-10" />

                 {/* Top Badge for specific items (simulating 'Award') */}
                 {index % 3 === 0 && (
                     <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 p-1.5 rounded-full" title="Top Employer">
                         <Award size={16} />
                     </div>
                 )}

                <CardBody className="flex flex-col items-center text-center p-6 pt-10">
                  <div className="w-24 h-24 rounded-2xl mb-5 bg-white shadow-sm border border-gray-100 flex items-center justify-center p-4">
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="w-full h-full object-contain"
                      />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors mb-2">{company.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                     <Badge variant="outline" className="text-xs border-accent/20 text-accent bg-accent/5">{company.industry}</Badge>
                     <span className="flex items-center text-xs font-medium text-yellow-500 gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                        <Star size={12} fill="currentColor" /> {4 + (index % 10) / 10}
                     </span>
                  </div>

                  <p className="text-sm text-secondary line-clamp-2 mb-6 h-10">{company.description}</p>
                  
                  <div className="mt-auto w-full pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-secondary">
                      <div className="flex items-center gap-1">
                          <MapPin size={14} /> Jakarta, ID
                      </div>
                      <span className="group-hover:translate-x-1 transition-transform text-primary font-medium">View Profile &rarr;</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
          ) : (
             <div className="col-span-full py-20 text-center text-secondary">
                <p>No companies found matching "{searchTerm}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
