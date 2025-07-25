// Mock data for domains and DNS records

export interface Domain {
  id: string;
  userId: string;
  domainName: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'pending';
  recordCount: number;
}

export interface DNSRecord {
  id: string;
  domainId: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  site: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Mock domains
export const mockDomains: Domain[] = [
  {
    id: '1',
    userId: '2',
    domainName: 'example.com',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
    recordCount: 8
  },
  {
    id: '2',
    userId: '2',
    domainName: 'myapp.dev',
    createdAt: '2024-02-20T14:15:00Z',
    status: 'active',
    recordCount: 5
  },
  {
    id: '3',
    userId: '2',
    domainName: 'testsite.org',
    createdAt: '2024-03-10T09:45:00Z',
    status: 'pending',
    recordCount: 3
  }
];

// Mock DNS records
export const mockDNSRecords: DNSRecord[] = [
  {
    id: '1',
    domainId: '1',
    type: 'A',
    name: '@',
    value: '192.168.1.100',
    ttl: 3600,
    site: 'Main Site',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    domainId: '1',
    type: 'CNAME',
    name: 'www',
    value: 'example.com',
    ttl: 3600,
    site: 'WWW Redirect',
    status: 'active',
    createdAt: '2024-01-15T10:35:00Z',
    updatedAt: '2024-01-15T10:35:00Z'
  },
  {
    id: '3',
    domainId: '1',
    type: 'MX',
    name: '@',
    value: '10 mail.example.com',
    ttl: 3600,
    site: 'Email',
    status: 'active',
    createdAt: '2024-01-15T10:40:00Z',
    updatedAt: '2024-01-15T10:40:00Z'
  },
  {
    id: '4',
    domainId: '2',
    type: 'A',
    name: '@',
    value: '203.0.113.50',
    ttl: 1800,
    site: 'App Server',
    status: 'active',
    createdAt: '2024-02-20T14:15:00Z',
    updatedAt: '2024-02-20T14:15:00Z'
  }
];

// Data service class
class DataService {
  private static instance: DataService;
  private domains: Domain[] = [...mockDomains];
  private dnsRecords: DNSRecord[] = [...mockDNSRecords];

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Domain methods
  getDomainsByUserId(userId: string): Domain[] {
    return this.domains.filter(domain => domain.userId === userId);
  }

  getAllDomains(): Domain[] {
    return this.domains;
  }

  getDomainById(id: string): Domain | undefined {
    return this.domains.find(domain => domain.id === id);
  }

  createDomain(domain: Omit<Domain, 'id' | 'createdAt' | 'recordCount'>): Domain {
    const newDomain: Domain = {
      ...domain,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      recordCount: 0
    };
    this.domains.push(newDomain);
    return newDomain;
  }

  deleteDomain(id: string): boolean {
    const index = this.domains.findIndex(domain => domain.id === id);
    if (index > -1) {
      this.domains.splice(index, 1);
      // Also delete associated DNS records
      this.dnsRecords = this.dnsRecords.filter(record => record.domainId !== id);
      return true;
    }
    return false;
  }

  // DNS Record methods
  getDNSRecordsByDomainId(domainId: string): DNSRecord[] {
    return this.dnsRecords.filter(record => record.domainId === domainId);
  }

  getAllDNSRecords(): DNSRecord[] {
    return this.dnsRecords;
  }

  createDNSRecord(record: Omit<DNSRecord, 'id' | 'createdAt' | 'updatedAt'>): DNSRecord {
    const newRecord: DNSRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.dnsRecords.push(newRecord);
    
    // Update domain record count
    const domain = this.domains.find(d => d.id === record.domainId);
    if (domain) {
      domain.recordCount = this.getDNSRecordsByDomainId(record.domainId).length;
    }
    
    return newRecord;
  }

  updateDNSRecord(id: string, updates: Partial<DNSRecord>): DNSRecord | undefined {
    const index = this.dnsRecords.findIndex(record => record.id === id);
    if (index > -1) {
      this.dnsRecords[index] = {
        ...this.dnsRecords[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return this.dnsRecords[index];
    }
    return undefined;
  }

  deleteDNSRecord(id: string): boolean {
    const index = this.dnsRecords.findIndex(record => record.id === id);
    if (index > -1) {
      const record = this.dnsRecords[index];
      this.dnsRecords.splice(index, 1);
      
      // Update domain record count
      const domain = this.domains.find(d => d.id === record.domainId);
      if (domain) {
        domain.recordCount = this.getDNSRecordsByDomainId(record.domainId).length;
      }
      
      return true;
    }
    return false;
  }
}

export const dataService = DataService.getInstance();