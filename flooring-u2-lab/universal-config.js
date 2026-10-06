/* RUNLU Flooring OS Universal · U0 configuration foundation
   Independent from the preserved Deerfoot production edition. */
(function(){
  'use strict';

  const DEFAULTS = Object.freeze({
    product: {
      name: 'RUNLU Flooring OS',
      edition: 'Universal',
      stage: 'U0'
    },
    company: {
      organizationId: '',
      legalName: '',
      displayName: '',
      abbreviation: '',
      country: 'CA',
      region: '',
      currency: 'CAD',
      locale: 'en-CA',
      timezone: 'America/Edmonton'
    },
    location: {
      locationId: '',
      name: '',
      type: 'store'
    },
    numbering: {
      po: { mode: 'company-configured', prefix: '', nextNumber: null },
      claim: { mode: 'company-configured', prefix: '', nextNumber: null },
      invoice: { mode: 'company-configured', prefix: '', nextNumber: null }
    },
    integrations: {
      warehouseUrl: '',
      warehouseEnabled: false
    },
    jurisdiction: {
      taxProfile: '',
      complianceProfile: ''
    },
    documents: {
      supplierOrderTitle: 'SUPPLIER ORDER',
      warehouseHandoffTitle: 'WAREHOUSE HANDOFF',
      invoiceTitle: 'INVOICE'
    }
  });

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function merge(base, patch){
    const out=clone(base);
    Object.keys(patch||{}).forEach(k=>{
      const v=patch[k];
      if(v && typeof v==='object' && !Array.isArray(v) && out[k] && typeof out[k]==='object') out[k]=merge(out[k],v);
      else out[k]=v;
    });
    return out;
  }

  window.RUNLUFlooringUniversal = Object.freeze({
    defaults: clone(DEFAULTS),
    createConfig(overrides){ return merge(DEFAULTS, overrides||{}); },
    tenantReady(config){
      const c=config||{};
      return Boolean(c.company?.organizationId && c.company?.legalName && c.location?.locationId);
    }
  });
})();
