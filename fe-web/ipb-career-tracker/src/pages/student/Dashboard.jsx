import React, { useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { APPLICATIONS, USERS, OPPORTUNITIES, COMPANIES } from '../../data/mockData';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, Clock, Plus, X, Building, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function StudentDashboard() {
  const user = USERS.student;
  const myApplications = APPLICATIONS.filter(app => app.studentId === user.id);
  const activeApplications = myApplications.filter(app => ['Applied', 'Interview', 'Screening'].includes(app.status));
  
  // Custom Externship State
  const [showExternshipModal, setShowExternshipModal] = useState(false);
  const [externships, setExternships] = useState([
      { id: 1, title: 'Freelance Web Dev', company: 'Upwork Project', duration: '3 months', status: 'Ongoing' }
  ]);
  const [newExternship, setNewExternship] = useState({ title: '', company: '', duration: '', status: 'Ongoing' });

  const handleAddExternship = (e) => {
      e.preventDefault();
      const id = externships.length + 1;
      setExternships([...externships, { id, ...newExternship }]);
      setNewExternship({ title: '', company: '', duration: '', status: 'Ongoing' });
      setShowExternshipModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen pb-20">
      <div className="border-b border-gray-200 pb-8 bg-white p-8 -mx-8 -mt-8 mb-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-primary tracking-tight">Hello, {user.name.split(' ')[0]}.</h1>
        <p className="text-secondary mt-2 text-lg">Here is your career overview for today.</p>
      </div>

      {/* Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-lg bg-white border border-highlight/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Briefcase size={64} className="text-primary" />
          </div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-widest">Active Applications</p>
          <p className="text-4xl font-bold text-primary mt-3">{activeApplications.length}</p>
        </div>
        <div className="p-5 rounded-lg bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <FileText size={64} className="text-secondary" />
          </div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-widest">Total Applications</p>
          <p className="text-4xl font-bold text-primary mt-3">{myApplications.length}</p>
        </div>
        <div className="p-5 rounded-lg bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <CheckCircle size={64} className="text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-widest">Profile Status</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-4xl font-bold text-primary">85%</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Almost there</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-primary flex items-center gap-2"><Clock size={18} /> Recent Activity</h2>
                    <Link to="/student/applications" className="text-sm text-secondary hover:text-primary underline decoration-gray-300 underline-offset-4">View tracker</Link>
                </div>
                
                <div className="space-y-3">
                    {myApplications.slice(0, 3).map(app => {
                        const job = OPPORTUNITIES.find(o => o.id === app.opportunityId);
                        return (
                            <div key={app.id} className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-colors shadow-sm">
                                <div>
                                    <h3 className="font-medium text-primary">{job?.title}</h3>
                                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                                        <Building size={12} /> {COMPANIES.find(c => c.id === job?.companyId)?.name} 
                                        <span className="mx-1">&middot;</span> 
                                        <Clock size={12} /> Applied {app.appliedAt}
                                    </p>
                                </div>
                                <Badge variant={app.status === 'Rejected' ? 'error' : app.status === 'Accepted' ? 'success' : 'info'}>
                                    {app.status}
                                </Badge>
                            </div>
                        )
                    })}
                    {myApplications.length === 0 && <p className="text-secondary italic">No applications yet. Start exploring.</p>}
                </div>
            </div>

            {/* My Externships Section */}
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Briefcase size={18} /> My Externships / Projects
                    </h2>
                    <button 
                        onClick={() => setShowExternshipModal(true)}
                        className="text-sm flex items-center gap-1 text-primary hover:text-accent font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={16} /> Add Manual Entry
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {externships.map((ext) => (
                        <div key={ext.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-primary">{ext.title}</h3>
                            <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                                <Building size={14} /> {ext.company}
                            </p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {ext.duration}</span>
                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{ext.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary">My Notes</h2>
              <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-lg min-h-[200px] relative shadow-sm">
                  <p className="text-sm text-yellow-800/60 font-medium mb-3 flex items-center gap-2">
                      <FileText size={14} /> Quick Scratchpad
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-sm text-secondary">
                      <li>Update CV with new project</li>
                      <li>Research interview questions for Tokopedia</li>
                      <li>Check scholarship deadline</li>
                  </ul>
                  <div className="absolute bottom-4 right-4 text-xs text-secondary/50">Editable (Mock)</div>
              </div>
          </div>
      </div>

      {/* Custom Externship Modal */}
      {showExternshipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExternshipModal(false)} />
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-primary">Add Experience</h3>
                      <button onClick={() => setShowExternshipModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleAddExternship} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-secondary mb-1">Role / Title</label>
                          <Input 
                            required
                            placeholder="e.g. Freelance Designer" 
                            value={newExternship.title}
                            onChange={e => setNewExternship({...newExternship, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-secondary mb-1">Company / Client</label>
                          <Input 
                            required
                            placeholder="e.g. Upwork" 
                            value={newExternship.company}
                            onChange={e => setNewExternship({...newExternship, company: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Duration</label>
                            <Input 
                                placeholder="e.g. 3 Months" 
                                value={newExternship.duration}
                                onChange={e => setNewExternship({...newExternship, duration: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                            <select 
                                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                                value={newExternship.status}
                                onChange={e => setNewExternship({...newExternship, status: e.target.value})}
                            >
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex gap-3">
                          <Button type="button" variant="outline" className="flex-1 justify-center" onClick={() => setShowExternshipModal(false)}>Cancel</Button>
                          <Button type="submit" variant="primary" className="flex-1 justify-center">Add Entry</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
