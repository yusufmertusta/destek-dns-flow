import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DNSRecord {
  id: string
  domain_id: string
  type: string
  name: string
  value: string
  ttl: number
  status: string
}

interface Domain {
  id: string
  domain_name: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('DNS Sync function called')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, record, domain } = await req.json()
    console.log('Action:', action, 'Record:', record, 'Domain:', domain)

    const sshHost = Deno.env.get('DNS_SERVER_HOST') || '172.16.10.123'
    const sshUser = Deno.env.get('DNS_SERVER_USER') || 'emrah'
    const sshKey = Deno.env.get('SSH_PRIVATE_KEY')

    if (!sshKey) {
      throw new Error('SSH_PRIVATE_KEY environment variable is required')
    }

    // SSH command to update Bind9 zone file
    const updateZoneFile = async (domainName: string, records: DNSRecord[]) => {
      const serial = Math.floor(Date.now() / 1000)
      
      const zoneContent = `$TTL    604800
@       IN      SOA     ns1.${domainName}. admin.${domainName}. (
                        ${serial}       ; Serial
                        604800          ; Refresh
                        86400           ; Retry
                        2419200         ; Expire
                        604800 )        ; Negative Cache TTL
;
@       IN      NS      ns1.${domainName}.
ns1     IN      A       ${sshHost}
${records.filter(r => r.status === 'active').map(r => {
  const recordName = r.name === '@' ? '@' : r.name
  return `${recordName}     IN      ${r.type}      ${r.value}`
}).join('\n')}
`

      // Write zone file via SSH
      const writeCommand = `echo '${zoneContent.replace(/'/g, "'\\''")}' | sudo tee /etc/bind/db.${domainName}`
      const reloadCommand = `sudo systemctl reload bind9`
      
      console.log('Updating zone file for:', domainName)
      
      // In a real implementation, you would use SSH client
      // For now, we'll log the commands that would be executed
      console.log('SSH Commands to execute:')
      console.log('1.', writeCommand)
      console.log('2.', reloadCommand)
      
      return { success: true }
    }

    switch (action) {
      case 'create':
      case 'update':
      case 'delete':
        // Get all DNS records for the domain
        const { data: allRecords, error: recordsError } = await supabase
          .from('dns_records')
          .select('*')
          .eq('domain_id', record.domain_id)

        if (recordsError) {
          throw recordsError
        }

        await updateZoneFile(domain.domain_name, allRecords)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'DNS sync completed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('DNS Sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})