import { supabase } from '@/integrations/supabase/client';

// Domain and DNS record interfaces using legacy format for compatibility
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

// Internal database interfaces
interface DBDomain {
  id: string;
  user_id: string;
  domain_name: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

interface DBDNSRecord {
  id: string;
  domain_id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  site?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Utility functions to convert between database schema and app interface
function domainFromDB(domain: DBDomain, recordCount: number = 0): Domain {
  return {
    id: domain.id,
    userId: domain.user_id,
    domainName: domain.domain_name,
    createdAt: domain.created_at,
    status: domain.status,
    recordCount
  };
}

function domainToDB(domain: Omit<Domain, 'id' | 'recordCount' | 'createdAt'>): Omit<DBDomain, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: domain.userId,
    domain_name: domain.domainName,
    status: domain.status
  };
}

function dnsRecordFromDB(record: DBDNSRecord): DNSRecord {
  return {
    id: record.id,
    domainId: record.domain_id,
    type: record.type,
    name: record.name,
    value: record.value,
    ttl: record.ttl,
    site: record.site || '',
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

function dnsRecordToDB(record: Omit<DNSRecord, 'id' | 'createdAt' | 'updatedAt'>): Omit<DBDNSRecord, 'id' | 'created_at' | 'updated_at'> {
  return {
    domain_id: record.domainId,
    type: record.type,
    name: record.name,
    value: record.value,
    ttl: record.ttl,
    site: record.site,
    status: record.status
  };
}

// Data service class using Supabase
class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // DNS Sync method to communicate with Bind9 server
  private async syncDNSRecord(action: 'create' | 'update' | 'delete', record: DNSRecord): Promise<void> {
    try {
      // Get domain information
      const domain = await this.getDomainById(record.domainId);
      if (!domain) {
        console.error('Domain not found for DNS sync');
        return;
      }

      // Call the edge function to sync with Bind9
      const { data, error } = await supabase.functions.invoke('sync-dns', {
        body: {
          action,
          record,
          domain: {
            id: domain.id,
            domain_name: domain.domainName
          }
        }
      });

      if (error) {
        console.error('DNS sync error:', error);
      } else {
        console.log('DNS sync successful:', data);
      }
    } catch (error) {
      console.error('Failed to sync DNS record:', error);
    }
  }

  // Domain methods 
  async getDomainsByUserId(userId: string): Promise<Domain[]> {
    try {
      const { data: domains, error } = await supabase
        .from('domains')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const domainList: Domain[] = [];
      
      for (const domain of domains || []) {
        // Get record count for each domain
        const { count } = await supabase
          .from('dns_records')
          .select('*', { count: 'exact', head: true })
          .eq('domain_id', domain.id);
        
        domainList.push(domainFromDB(domain, count || 0));
      }

      return domainList;
    } catch (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
  }

  async getAllDomains(): Promise<Domain[]> {
    try {
      const { data: domains, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const domainList: Domain[] = [];
      
      for (const domain of domains || []) {
        // Get record count for each domain
        const { count } = await supabase
          .from('dns_records')
          .select('*', { count: 'exact', head: true })
          .eq('domain_id', domain.id);
        
        domainList.push(domainFromDB(domain, count || 0));
      }

      return domainList;
    } catch (error) {
      console.error('Error fetching all domains:', error);
      return [];
    }
  }

  async getDomainById(id: string): Promise<Domain | undefined> {
    try {
      const { data: domain, error } = await supabase
        .from('domains')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!domain) return undefined;

      // Get record count
      const { count } = await supabase
        .from('dns_records')
        .select('*', { count: 'exact', head: true })
        .eq('domain_id', domain.id);

      return domainFromDB(domain, count || 0);
    } catch (error) {
      console.error('Error fetching domain:', error);
      return undefined;
    }
  }

  async createDomain(domain: Omit<Domain, 'id' | 'createdAt' | 'recordCount'>): Promise<Domain | null> {
    try {
      const { data, error } = await supabase
        .from('domains')
        .insert([domainToDB(domain)])
        .select()
        .single();

      if (error) throw error;

      return domainFromDB(data, 0);
    } catch (error) {
      console.error('Error creating domain:', error);
      return null;
    }
  }

  async deleteDomain(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting domain:', error);
      return false;
    }
  }

  // DNS Record methods
  async getDNSRecordsByDomainId(domainId: string): Promise<DNSRecord[]> {
    try {
      const { data: records, error } = await supabase
        .from('dns_records')
        .select('*')
        .eq('domain_id', domainId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (records || []).map(dnsRecordFromDB);
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      return [];
    }
  }

  async getAllDNSRecords(): Promise<DNSRecord[]> {
    try {
      const { data: records, error } = await supabase
        .from('dns_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (records || []).map(dnsRecordFromDB);
    } catch (error) {
      console.error('Error fetching all DNS records:', error);
      return [];
    }
  }

  async createDNSRecord(record: Omit<DNSRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DNSRecord | null> {
    try {
      const { data, error } = await supabase
        .from('dns_records')
        .insert([dnsRecordToDB(record)])
        .select()
        .single();

      if (error) throw error;

      const newRecord = dnsRecordFromDB(data);
      
      // Sync with Bind9 DNS server
      await this.syncDNSRecord('create', newRecord);

      return newRecord;
    } catch (error) {
      console.error('Error creating DNS record:', error);
      return null;
    }
  }

  async updateDNSRecord(id: string, updates: Partial<DNSRecord>): Promise<DNSRecord | undefined> {
    try {
      const { data, error } = await supabase
        .from('dns_records')
        .update(dnsRecordToDB(updates as any))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRecord = dnsRecordFromDB(data);
      
      // Sync with Bind9 DNS server
      await this.syncDNSRecord('update', updatedRecord);

      return updatedRecord;
    } catch (error) {
      console.error('Error updating DNS record:', error);
      return undefined;
    }
  }

  async deleteDNSRecord(id: string): Promise<boolean> {
    try {
      // Get the record before deleting for sync
      const { data: recordData, error: fetchError } = await supabase
        .from('dns_records')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('dns_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Sync with Bind9 DNS server
      if (recordData) {
        await this.syncDNSRecord('delete', dnsRecordFromDB(recordData));
      }

      return true;
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      return false;
    }
  }
}

export const dataService = DataService.getInstance();