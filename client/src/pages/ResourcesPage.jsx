import React from 'react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { FileText, Download, ExternalLink } from 'lucide-react';

const ResourcesPage = () => {
  return (
    <AppLayout>
      <Header title="Resources" />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-7 md:p-8">
          <h2 className="text-lg sm:text-xl font-medium text-card-foreground mb-3 sm:mb-4">Learning Resources</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Access study materials, guides, and useful links for your academic journey.
          </p>
          
          {/* Placeholder Content */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-background rounded-lg border border-border p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">Resource Title #{item}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      A brief description of this resource and what it contains for students.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button className="inline-flex items-center text-xs text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full transition-colors">
                        <Download size={14} className="mr-1" />
                        Download
                      </button>
                      <button className="inline-flex items-center text-xs text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full transition-colors">
                        <ExternalLink size={14} className="mr-1" />
                        View Online
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: Mar {5 + item}, 2023
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default ResourcesPage; 