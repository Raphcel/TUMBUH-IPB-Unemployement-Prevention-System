import React from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { OPPORTUNITIES, APPLICATIONS } from '../../data/mockData';
import { Users, Briefcase, FileText, BarChart3 } from 'lucide-react';

export function HRDashboard() {
  const companyId = 101; // Mock Tokopedia
  const myJobs = OPPORTUNITIES.filter(o => o.companyId === companyId);
  const myApplicants = APPLICATIONS.filter(a => myJobs.find(j => j.id === a.opportunityId));

  const stats = [
    { title: 'Total Applicants', value: myApplicants.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Active Jobs', value: myJobs.length, icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Pending Review', value: myApplicants.filter(a => a.status === 'Applied').length, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-primary tracking-tight">Recruitment Dashboard</h1>
        <p className="text-secondary mt-2">Overview of your hiring pipeline.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
           <Card key={index} className="border-gray-100 shadow-sm hover:shadow-md transition-all">
             <CardBody className="flex items-center gap-4 p-6">
               <div className={`p-3 rounded-xl ${stat.bg}`}>
                 <stat.icon size={24} className={stat.color} />
               </div>
               <div>
                 <p className="text-sm font-medium text-secondary">{stat.title}</p>
                 <p className="text-3xl font-bold text-primary mt-1">{stat.value}</p>
               </div>
             </CardBody>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
             <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <BarChart3 size={20} /> Recruitment Stats
             </h2>
             <Card className="h-64 flex flex-col items-center justify-center text-secondary bg-gray-50/50 border-dashed border-2 border-gray-200 rounded-xl">
                 <BarChart3 size={48} className="text-gray-300 mb-2" />
                 <span className="text-sm font-medium">Chart visualization would appear here</span>
             </Card>
        </div>
        
         <div className="space-y-4">
             <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Briefcase size={20} /> Recent Jobs
             </h2>
             <div className="space-y-3">
                 {myJobs.slice(0, 3).map(job => (
                     <Card key={job.id} className="border-gray-100">
                         <CardBody className="p-4 flex justify-between items-center">
                             <div>
                                 <h3 className="font-medium text-primary">{job.title}</h3>
                                 <p className="text-xs text-secondary mt-1">{job.location} • {job.type}</p>
                             </div>
                             <span className="text-xs font-semibold px-2 py-1 rounded bg-green-50 text-green-700">Active</span>
                         </CardBody>
                     </Card>
                 ))}
             </div>
        </div>
      </div>
    </div>
  );
}
