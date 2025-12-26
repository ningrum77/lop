
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActivityReport, Template, LetterheadConfig } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  reports: ActivityReport[];
  templates: Template[];
  letterhead: LetterheadConfig;
}

const PrintableReport: React.FC<Props> = ({ reports, templates, letterhead }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = reports.find(r => r.id === id);
  const template = templates.find(t => t.id === report?.templateId);

  // Helper untuk mengubah teks menjadi Title Case
  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const renderMemoHeader = () => {
    if (!report) return "";
    
    const formattedDate = new Date(report.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
      <div style="display: flex; align-items: flex-start; margin-bottom: 0px; font-family: 'Times New Roman', serif;">
        <div style="width: 75px; flex-shrink: 0; padding-bottom: 10px;">
          ${letterhead.logoPemkab ? `<img src="${letterhead.logoPemkab}" style="width: 70px; height: auto;" />` : '<div style="width:70px; height:70px; border:1px dashed #ccc;"></div>'}
        </div>
        <div style="flex: 1; padding-left: 25px; font-size: 11.5px; color: #000;">
          <table style="width: 100%; border-collapse: collapse; border: none !important;">
            <tr style="border: none !important;">
              <td style="width: 80px; padding: 2px 0; border: none !important;">Kepada Yth</td>
              <td style="width: 15px; padding: 2px 0; text-align: center; border: none !important;">:</td>
              <td style="padding: 2px 0; border: none !important;">Kepala Dinas Kesehatan Kabupaten Tegal</td>
            </tr>
            <tr style="border: none !important;">
              <td style="padding: 2px 0; border: none !important;">Dari</td>
              <td style="padding: 2px 0; text-align: center; border: none !important;">:</td>
              <td style="padding: 2px 0; border: none !important;">Petugas ${toTitleCase(letterhead.puskesmasName)}</td>
            </tr>
            <tr style="border: none !important;">
              <td style="padding: 2px 0; border: none !important;">Tanggal</td>
              <td style="padding: 2px 0; text-align: center; border: none !important;">:</td>
              <td style="padding: 2px 0; border: none !important;">${formattedDate}</td>
            </tr>
            <tr style="border: none !important;">
              <td style="padding: 2px 0; border: none !important;">Perihal</td>
              <td style="padding: 2px 0; text-align: center; border: none !important;">:</td>
              <td style="padding: 2px 0; border: none !important;">Laporan perjalanan dinas</td>
            </tr>
          </table>
        </div>
      </div>
      <div style="border-bottom: 2.5px solid #000; margin-bottom: 0px;"></div>
    `;
  };

  const renderOfficialLetterhead = () => {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; font-family: 'Times New Roman', serif;">
        <div style="width: 70px; flex-shrink: 0;">
          ${letterhead.logoPemkab ? `<img src="${letterhead.logoPemkab}" style="width: 65px; height: auto;" />` : ''}
        </div>
        <div style="flex: 1; text-align: center; padding: 0 10px;">
          <p style="font-size: 13px; font-weight: bold; margin: 0; text-transform: uppercase; text-indent: 0 !important;">${letterhead.govName}</p>
          <p style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase; text-indent: 0 !important;">${letterhead.deptName}</p>
          <p style="font-size: 16px; font-weight: 900; margin: 0; text-transform: uppercase; color: #0d9488; text-indent: 0 !important;">${letterhead.puskesmasName}</p>
          <p style="font-size: 10px; margin: 2px 0 0 0; text-indent: 0 !important;">${letterhead.address}</p>
          <p style="font-size: 9px; margin: 0; text-indent: 0 !important;">Telp: ${letterhead.phone} • Email: ${letterhead.email} • Web: ${letterhead.website}</p>
        </div>
        <div style="width: 70px; flex-shrink: 0; text-align: right;">
          ${letterhead.logoPuskesmas ? `<img src="${letterhead.logoPuskesmas}" style="width: 65px; height: auto;" />` : ''}
        </div>
      </div>
      <div style="border-bottom: 1.5px solid #000; margin-top: 2px;"></div>
      <div style="border-bottom: 3.5px solid #000; margin-top: 2px; margin-bottom: 15px;"></div>
    `;
  };

  const renderSignature = () => {
    if (!report || !report.staffNames.length) return "";
    
    let rows = report.staffNames.map((name, i) => `
      <div style="margin-bottom: 12px; display: flex; align-items: flex-end; justify-content: space-between;">
        <div style="font-size: 11px;">${i + 1}. ${toTitleCase(name)}</div>
        <div style="border-bottom: 1px dotted #000; width: 80px; height: 1px;"></div>
      </div>
    `).join('');

    return `
      <div style="width: 220px; margin-left: auto; margin-top: 40px; font-family: 'Times New Roman', serif;">
        <p style="font-size: 11px; text-align: center; margin-bottom: 15px; font-weight: bold; text-indent: 0 !important;">Pelaksana Kegiatan:</p>
        <div style="padding-left: 10px;">
          ${rows}
        </div>
      </div>
    `;
  };

  const processedBody = useMemo(() => {
    if (!report || !template || !template.body) return "";
    let body = template.body;
    
    // Ganti tag khusus
    body = body.replace(/\{\{kop_memo\}\}/g, ""); 
    body = body.replace(/\{\{kop_surat\}\}/g, renderOfficialLetterhead());
    body = body.replace(/\{\{tanda_tangan\}\}/g, renderSignature());

    const regex = /\{\{(.*?)\}\}/g;
    const matches = Array.from(template.body.matchAll(regex));
    const variables = [...new Set(matches.map(m => m[1].trim()))];

    variables.forEach(v => {
      if (['kop_memo', 'kop_surat', 'tanda_tangan'].includes(v)) return;
      
      let val = (report.content && report.content[v]) || "";
      
      if (!val && v === 'nomor_spt') val = report.sptNumber || "";
      if (!val && v === 'tanggal_spt') val = report.sptDate ? new Date(report.sptDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "";
      if (!val && v === 'tanggal_kegiatan') val = new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!val && v === 'lokasi_kegiatan') val = report.location;

      const escapedV = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const varRegex = new RegExp(`\\{\\{${escapedV}\\}\\}`, 'g');
      body = body.replace(varRegex, val.replace(/\n/g, '<br>'));
    });
    
    return body;
  }, [report, template, letterhead]);

  if (!report) return <div className="p-20 text-center font-bold">Laporan tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-20 print:pb-0">
      <div className="max-w-[215mm] mx-auto pt-8 mb-8 flex justify-between items-center print:hidden px-4 md:px-0">
        <button onClick={() => navigate('/reports')} className="flex items-center space-x-2 text-slate-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <ArrowLeft size={18} /><span>Kembali</span>
        </button>
        <button onClick={() => window.print()} className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:bg-teal-700">
          <Printer size={18} /><span>CETAK SEKARANG</span>
        </button>
      </div>

      <div className="max-w-[215mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[330mm] p-[15mm] text-black mb-10 print:mb-0 font-serif">
        <style dangerouslySetInnerHTML={{ __html: `
          @page { size: 215mm 330mm; margin: 0mm; }
          @media print {
            body { background: white; -webkit-print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .page-break { page-break-before: always; }
          }
          .main-grid {
            display: grid;
            grid-template-columns: 20mm 1fr;
            min-height: 250mm;
          }
          .disposisi-column {
            border-right: 1.5px solid #000;
            padding-right: 5px;
            padding-top: 15px;
          }
          .disposisi-label {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin: 0 auto;
            display: block;
          }
          .content-column {
            padding-left: 20px;
            padding-top: 15px;
          }
          table { border-collapse: collapse; width: 100%; text-indent: 0 !important; }
          th, td { border: 1px solid black; padding: 4px; font-size: 11px; text-indent: 0 !important; }
          p { 
            margin: 0 0 10px 0; 
            line-height: 1.5; 
            font-size: 11.5px; 
            text-indent: 40px; 
            text-align: justify;
          }
          .report-title {
            text-align: center;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 20px;
            text-transform: uppercase;
            text-indent: 0 !important;
          }
          .content-area { text-align: justify; }
          .memo-header-table td { border: none !important; text-indent: 0 !important; }
        `}} />

        {(!template || !template.body.includes('{{kop_surat}}')) && (
          <div dangerouslySetInnerHTML={{ __html: renderMemoHeader() }} />
        )}

        <div className="main-grid">
          <div className="disposisi-column">
            <div className="disposisi-label">DISPOSISI</div>
          </div>

          <div className="content-column">
            {(!template || !template.body.includes('LAPORAN HASIL KEGIATAN')) && (
              <div className="report-title">LAPORAN HASIL KEGIATAN</div>
            )}
            <div className="content-area" dangerouslySetInnerHTML={{ __html: processedBody }} />
          </div>
        </div>
      </div>

      {report.images && report.images.length > 0 && (
        <div className="max-w-[215mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[330mm] p-[20mm] text-black page-break mt-10 print:mt-0 font-serif">
          <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline' }}>DOKUMENTASI KEGIATAN</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {report.images.map((img, idx) => (
              <div key={idx} style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                <img src={img} style={{ width: '100%', height: '220px', objectFit: 'cover', marginBottom: '5px' }} />
                <p style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, textIndent: 0 }}>FOTO KEGIATAN {idx + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintableReport;
