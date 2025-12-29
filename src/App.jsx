import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area
} from 'recharts';
import { 
  PlusCircle, Download, Trash2, Activity, MapPin, 
  AlertTriangle, CheckCircle, BarChart2, X, Search, Upload, Save, Check, RefreshCw, List,
  FileText, Clock, AlertOctagon, Hash, Lock, Key, ClipboardList, Shield, Eye, LogOut, User,
  Palette, Layout, ChevronRight, ArrowRight, Sun, Moon, Coffee, Leaf, Filter, TrendingUp, 
  PieChart as PieIcon, FileSpreadsheet, Wand2, Droplet, Anchor, Wind, Mountain, Edit3, Undo2,
  MousePointerClick, AlertCircle, Calendar, MessageSquare
} from 'lucide-react';

// --- CONFIGURACIÓN FIJA ---
const ZONAS = ['Pope', 'Secado', 'Formacion', 'Clarificacion'];
const TIPOS = ['LDA', 'FC']; 

// --- OPCIONES ---
const CRITICIDAD_OPTS = ['A', 'B', 'C'];
const ESTADO_OPTS = ['EJECUTADO', 'EN PROCESO', 'ATRASADO'];
const DOC_OPTS = ['SIN DOC', 'LUP', 'LILA', 'POE', 'ACR'];

const ZONE_ORDER = { 'Pope': 1, 'Secado': 2, 'Formacion': 3, 'Clarificacion': 4 };

// --- PALETAS DE COLORES ---
const PALETTES = [
  {
    id: 'poseidon',
    name: 'Poseidon Light',
    icon: <Anchor size={16}/>,
    colors: { 
      bgColor: '#DEEFE7',      
      headerColor: '#FFFFFF',  
      titleColor: '#002333',   
      accentColor: '#024554',  
      tabColor: '#002333'      
    }
  },
  {
    id: 'deep-teal',
    name: 'Deep Teal Sea',
    icon: <Droplet size={16}/>,
    colors: { bgColor: '#012E40', headerColor: '#024959', titleColor: '#F2E3D5', accentColor: '#3CA6A6', tabColor: '#026773' }
  },
  {
    id: 'northern',
    name: 'Northern Lights',
    icon: <Wind size={16}/>,
    colors: { bgColor: '#0B2B40', headerColor: '#164773', titleColor: '#89D99D', accentColor: '#3B8C6E', tabColor: '#1E5959' }
  },
  {
    id: '2238',
    name: '22:38 Theme',
    icon: <Clock size={16}/>,
    colors: { bgColor: '#10454F', headerColor: '#506266', titleColor: '#BDE038', accentColor: '#A3AB78', tabColor: '#818274' }
  },
  {
    id: 'crevasse',
    name: 'Crevasse Light',
    icon: <Mountain size={16}/>,
    colors: { bgColor: '#FFFFFF', headerColor: '#DEEFE7', titleColor: '#002333', accentColor: '#159A9C', tabColor: '#002333' }
  }
];

// --- UTILIDAD: GENERAR UUID ---
const generateUUID = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// --- UTILIDAD: FORMATEAR FECHA (YYYY-MM-DD a DD/MM/YY) ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const str = String(dateString);
  if (!str.includes('-')) return str;
  const parts = str.split('-');
  if (parts.length < 3) return str;
  const [year, month, day] = parts;
  if (!day || !month || !year) return str;
  return `${day}/${month}/${year.slice(2)}`;
};

// --- UTILIDAD: PARSEAR FECHA IMPORTACION (DD/MM/YY a YYYY-MM-DD) ---
const parseImportDate = (dateStr) => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const parts = str.split('/');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    let y = parts[2];
    if (y.length === 2) y = '20' + y;
    return `${y}-${m}-${d}`;
  }
  return '';
};

// --- COMPONENTE DASHBOARD AVANZADO ---
const AdvancedDashboard = ({ data, onClose, isAdmin, onRequestDelete, onEditStart }) => {
  const [filterZone, setFilterZone] = useState('TODAS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterCrit, setFilterCrit] = useState('TODAS');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchZone = filterZone === 'TODAS' || item.zona === filterZone;
      const matchStatus = filterStatus === 'TODOS' || item.estado === filterStatus;
      const matchCrit = filterCrit === 'TODAS' || item.criticidad === filterCrit;
      return matchZone && matchStatus && matchCrit;
    });
  }, [data, filterZone, filterStatus, filterCrit]);

  const totalItems = filteredData.length;
  const totalLDA = filteredData.filter(d => d.tipo === 'LDA').length;
  const totalFC = filteredData.filter(d => d.tipo === 'FC').length;
  const totalEjecutados = filteredData.filter(d => d.estado === 'EJECUTADO').length;
  const percentEjecutado = totalItems > 0 ? Math.round((totalEjecutados / totalItems) * 100) : 0;

  const getExecutionStats = (crit) => {
    const items = filteredData.filter(d => d.criticidad === crit);
    const total = items.length;
    const exec = items.filter(d => d.estado === 'EJECUTADO').length;
    const pct = total > 0 ? Math.round((exec / total) * 100) : 0;
    return { total, exec, pct };
  };

  const statsA = getExecutionStats('A');
  const statsB = getExecutionStats('B');
  const statsC = getExecutionStats('C');

  const zoneChartData = ZONAS.map(z => ({
    name: z,
    LDA: filteredData.filter(d => d.zona === z && d.tipo === 'LDA').length,
    FC: filteredData.filter(d => d.zona === z && d.tipo === 'FC').length
  }));

  const critChartData = CRITICIDAD_OPTS.map(c => {
    const subset = filteredData.filter(d => d.criticidad === c);
    return {
      name: `Criticidad ${c}`,
      EJECUTADO: subset.filter(d => d.estado === 'EJECUTADO').length,
      PROCESO: subset.filter(d => d.estado === 'EN PROCESO').length,
      PENDIENTE: subset.filter(d => d.estado === 'PENDIENTE').length, 
      ATRASADO: subset.filter(d => d.estado === 'ATRASADO').length
    };
  });

  const paretoData = useMemo(() => {
    const counts = ZONAS.map(z => ({
      name: z,
      count: filteredData.filter(d => d.zona === z).length
    })).sort((a, b) => b.count - a.count);

    let accum = 0;
    return counts.map(item => {
      accum += item.count;
      return {
        ...item,
        accumPct: totalItems > 0 ? Math.round((accum / totalItems) * 100) : 0
      };
    });
  }, [filteredData, totalItems]);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'EJECUTADO': return 'bg-green-50 text-green-600';
      case 'ATRASADO': return 'bg-red-50 text-red-600';
      case 'PENDIENTE': return 'bg-slate-100 text-slate-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  const handleChartClick = (data) => {
    if (data && data.activeLabel) {
      setFilterZone(data.activeLabel);
    } else if (data && data.name) {
      setFilterZone(data.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col overflow-hidden animate-fade-in text-slate-800">
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 uppercase">
          <BarChart2 className="text-blue-600"/> LUGARES DE DIFICIL ACCESO Y FUENTES DE CONTAMINACION MP1 - CAÑETE
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={24}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mr-4">
            <Filter size={16}/> Filtros Activos:
          </div>
          <select className="border p-2 rounded text-sm bg-slate-50" value={filterZone} onChange={e => setFilterZone(e.target.value)}>
            <option value="TODAS">Todas las Zonas</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <select className="border p-2 rounded text-sm bg-slate-50" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="TODOS">Todos los Estados</option>
            {ESTADO_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border p-2 rounded text-sm bg-slate-50" value={filterCrit} onChange={e => setFilterCrit(e.target.value)}>
            <option value="TODAS">Todas las Criticidades</option>
            {CRITICIDAD_OPTS.map(c => <option key={c} value={c}>Criticidad {c}</option>)}
          </select>
          <div className="ml-auto text-xs text-slate-400">Mostrando {totalItems} registros</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:scale-105 transition-transform duration-300 cursor-default group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={64} className="text-blue-500"/>
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">LDA Y FC TOTALES</div>
            <div className="text-4xl font-black text-slate-800">{totalItems}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#86efac] hover:scale-105 transition-transform duration-300 cursor-default group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MapPin size={64} className="text-green-500"/>
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">Total LDA</div>
            <div className="text-4xl font-black text-slate-800">{totalLDA}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#fef08a] hover:scale-105 transition-transform duration-300 cursor-default group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle size={64} className="text-yellow-500"/>
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">Total FC</div>
            <div className="text-4xl font-black text-slate-800">{totalFC}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 hover:scale-105 transition-transform duration-300 cursor-default group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle size={64} className="text-green-500"/>
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">% Global Ejecutado</div>
            <div className="text-4xl font-black text-slate-800">{percentEjecutado}%</div>
            <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${percentEjecutado}%` }}></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Avance por Criticidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-end mb-2">
                <div><span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded uppercase">Criticidad A</span><div className="text-2xl font-bold text-slate-800 mt-2">{statsA.pct}%</div></div>
                <div className="text-right text-xs text-slate-400">{statsA.exec} / {statsA.total} resueltos</div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${statsA.pct}%` }}></div></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-end mb-2">
                <div><span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded uppercase">Criticidad B</span><div className="text-2xl font-bold text-slate-800 mt-2">{statsB.pct}%</div></div>
                <div className="text-right text-xs text-slate-400">{statsB.exec} / {statsB.total} resueltos</div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${statsB.pct}%` }}></div></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-end mb-2">
                <div><span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase">Criticidad C</span><div className="text-2xl font-bold text-slate-800 mt-2">{statsC.pct}%</div></div>
                <div className="text-right text-xs text-slate-400">{statsC.exec} / {statsC.total} resueltos</div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${statsC.pct}%` }}></div></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><MapPin size={16}/> Distribución por Zona</h3>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">Clic en barras para filtrar</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneChartData} onClick={handleChartClick} style={{cursor: 'pointer'}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis fontSize={12} axisLine={false} tickLine={false}/>
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}}/>
                  <Legend />
                  <Bar dataKey="LDA" stackId="a" fill="#86efac" name="LDA" radius={[0,0,4,4]}/>
                  <Bar dataKey="FC" stackId="a" fill="#fef08a" name="FC" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><PieIcon size={16}/> Estatus por Criticidad</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={critChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" fontSize={12} hide/>
                  <YAxis dataKey="name" type="category" fontSize={12} width={80} tickLine={false} axisLine={false}/>
                  <Tooltip cursor={{fill: 'transparent'}}/>
                  <Legend />
                  <Bar dataKey="EJECUTADO" stackId="a" fill="#22c55e" radius={[0,4,4,0]}/>
                  <Bar dataKey="PROCESO" stackId="a" fill="#3b82f6"/>
                  <Bar dataKey="PENDIENTE" stackId="a" fill="#94a3b8"/>
                  <Bar dataKey="ATRASADO" stackId="a" fill="#ef4444" radius={[4,0,0,4]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><TrendingUp size={16}/> Diagrama de Pareto (Frecuencia por Zona)</h3>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">Clic para filtrar detalles</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoData} onClick={handleChartClick} style={{cursor: 'pointer'}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" domain={[0, 100]}/>
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#413ea0" barSize={40} name="Cantidad" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="accumPct" stroke="#ff7300" strokeWidth={3} dot={{r:4}} name="% Acumulado" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><List size={16}/> DETALLES FILTRADOS</h3>
            {!isAdmin && <span className="text-xs text-slate-400 flex items-center gap-1"><Lock size={10}/> Vista Solo Lectura</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Criticidad</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">F. Cierre</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map(item => (
                  <tr key={item.uuid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">
                      <span className={`px-2 py-1 rounded ${item.tipo === 'LDA' ? 'bg-[#86efac] text-black' : 'bg-[#fef08a] text-black'}`}>
                        {item.tipo} {item.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.zona}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${item.criticidad === 'A' ? 'bg-red-100 text-red-600' : item.criticidad === 'B' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {item.criticidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md truncate text-slate-600" title={item.desc}>{item.desc}</td>
                    <td className="px-4 py-3 text-xs font-mono">
                        {item.documento !== 'SIN DOC' ? (
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                            {item.documento} {item.codigoDoc ? ` - ${item.codigoDoc}` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(item.fechaCierre) || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${getStatusBadgeClass(item.estado)}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { onClose(); onEditStart(item); }} className="text-blue-500 hover:bg-blue-50 p-1 rounded" title="Editar"><Edit3 size={14}/></button>
                          <button onClick={() => onRequestDelete(item.uuid)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                        </div>
                      ) : (
                        <Lock size={14} className="text-slate-300 ml-auto"/>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState([]);
  const [appMode, setAppMode] = useState('cover'); 
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [theme, setTheme] = useState(PALETTES[0].colors);
  
  const [activeTab, setActiveTab] = useState('Pope');
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const fileInputRef = useRef(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkZone, setBulkZone] = useState('Pope');

  // Estado para Modal de Borrado
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Estado para Modal de Limpiar Todo
  const [showClearModal, setShowClearModal] = useState(false);

  // FORMULARIO Y EDICIÓN
  const [editingItemUuid, setEditingItemUuid] = useState(null); 
  const [newItem, setNewItem] = useState({
    zona: 'Pope',
    tipo: 'LDA',
    desc: '',
    criticidad: 'B',
    estado: 'EN PROCESO',
    documento: 'SIN DOC',
    codigoDoc: ''
  });

  const isAdmin = appMode === 'admin';

  useEffect(() => {
    const scriptId = 'xlsx-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '112358') {
      setAppMode('admin');
      setShowAuthModal(false);
      setPasswordInput('');
      showNotification("🔓 Modo Admin Activado");
    } else {
      showNotification("🔒 Contraseña incorrecta", "error");
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setAppMode('cover'); 
    setShowStats(false);
    setShowThemeModal(false);
    resetForm();
  };

  const getNextId = (tipo, zona, providedData = data) => {
    const existingIds = providedData.filter(d => d.tipo === tipo).map(d => d.id);
    return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  };

  const resetForm = () => {
    setEditingItemUuid(null);
    setNewItem({
      zona: 'Pope',
      tipo: 'LDA',
      desc: '',
      criticidad: 'B',
      estado: 'EN PROCESO',
      documento: 'SIN DOC',
      codigoDoc: '',
      fechaCierre: '',
      observaciones: ''
    });
  };

  // --- CREAR O ACTUALIZAR ---
  const handleSaveItem = (e) => {
    e.preventDefault();
    // CORREGIDO: Verificación robusta de descripción (evita crash si es undefined o número)
    if (!newItem.desc || !String(newItem.desc).trim()) {
      showNotification("⚠️ Descripción requerida", "error");
      return;
    }

    if (editingItemUuid) {
      // MODO EDICIÓN
      const updatedData = data.map(item => {
        if (item.uuid === editingItemUuid) {
          return {
            ...item,
            ...newItem,
            desc: String(newItem.desc).trim(), // Force string
            codigoDoc: newItem.documento === 'SIN DOC' ? '' : String(newItem.codigoDoc || '')
          };
        }
        return item;
      });
      setData(updatedData);
      showNotification("✏️ Registro actualizado correctamente");
      resetForm();
    } else {
      // MODO CREACIÓN
      const itemToAdd = {
        uuid: generateUUID(),
        id: getNextId(newItem.tipo, newItem.zona),
        zona: newItem.zona,
        ...newItem,
        desc: String(newItem.desc).trim(),
        codigoDoc: newItem.documento === 'SIN DOC' ? '' : String(newItem.codigoDoc || '')
      };
      setData(prev => [...prev, itemToAdd]);
      setNewItem(prev => ({ ...prev, desc: '', codigoDoc: '', fechaCierre: '', observaciones: '' })); 
      showNotification(`✅ Registro agregado`);
    }
  };

  // CORREGIDO: Inicialización robusta para evitar "uncontrolled input" y valores nulos
  const startEditingFull = (item) => {
    if (!isAdmin) return;
    setEditingItemUuid(item.uuid);
    setNewItem({
      zona: item.zona || 'Pope',
      tipo: item.tipo || 'LDA',
      desc: item.desc ? String(item.desc) : '', // Force string
      criticidad: item.criticidad || 'B',
      estado: item.estado || 'EN PROCESO',
      documento: item.documento || 'SIN DOC',
      codigoDoc: item.codigoDoc ? String(item.codigoDoc) : '', // Force string
      fechaCierre: item.fechaCierre || '', 
      observaciones: item.observaciones ? String(item.observaciones) : '' // Force string
    });
    setActiveTab(item.zona || 'Pope');
  };

  // SOLICITUD DE BORRADO (ABRE MODAL)
  const requestDelete = (uuid) => {
    if (!isAdmin) return;
    setItemToDelete(uuid);
    setDeleteModalOpen(true);
  };

  // CONFIRMACIÓN DE BORRADO
  const confirmDelete = () => {
    if (itemToDelete) {
      setData(prev => prev.filter(item => item.uuid !== itemToDelete));
      if (editingItemUuid === itemToDelete) resetForm();
      showNotification("🗑️ Eliminado correctamente");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // BORRAR TODO (Clear All)
  const handleClearAll = () => {
    setData([]);
    resetForm();
    setShowClearModal(false);
    showNotification("🗑️ Todos los datos han sido eliminados");
  };

  const renumberData = () => {
    if (!isAdmin) return;
    const processType = (type) => {
      return data.filter(d => d.tipo === type)
        .sort((a, b) => {
          if (ZONE_ORDER[a.zona] !== ZONE_ORDER[b.zona]) return ZONE_ORDER[a.zona] - ZONE_ORDER[b.zona];
          return a.id - b.id;
        })
        .map((item, index) => ({ ...item, id: index + 1 })); 
    };
    setData([...processType('LDA'), ...processType('FC')]);
    showNotification("🔄 Renumerado");
  };

  const processBulkText = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const newItems = [];
    let count = 0;
    
    // FORMATO ESPERADO: CODIGO - DESCRIPCION - CRITICIDAD - F. CIERRE - ESTADO - TIPO DOC - CODIGO DOC - OBSERVACIONES
    lines.forEach(line => {
      if (!line.trim()) return;
      
      // Intentar dividir por TAB (Excel copy) o por " - " (Separador visual personalizado)
      let parts = line.split('\t');
      if (parts.length < 2) {
         // Si no hay tabs, usar el separador de guion con espacios
         parts = line.split(' - ');
      }
      
      // Limpiar espacios extra
      parts = parts.map(p => p ? p.trim() : '');

      // Necesitamos al menos el código para procesar
      if (parts.length > 0) {
        const codigoRaw = parts[0] || ''; 
        // Parsear Código: LDA 1 -> Tipo: LDA, ID: 1
        const codeMatch = codigoRaw.match(/^(LDA|FC)[\s\-\.]*(\d+)/i);
        
        if (codeMatch) {
           // Mapeo de campos basado en índice
           // 0: Código, 1: Desc, 2: Crit, 3: Fecha, 4: Estado, 5: Doc, 6: CodDoc, 7: Obs
           
           const tipo = codeMatch[1].toUpperCase();
           const id = parseInt(codeMatch[2], 10);
           const desc = parts[1] || '';
           const criticidad = parts[2] ? parts[2].toUpperCase() : 'B';
           // Si la fecha es solo año (ej: 2024), se mantiene como string. Si es fecha completa con /, se parsea.
           let fechaCierre = parts[3] || '';
           if (fechaCierre.includes('/')) {
              fechaCierre = parseImportDate(fechaCierre);
           }
           
           const estado = parts[4] ? parts[4].toUpperCase() : 'EN PROCESO';
           const documento = parts[5] ? parts[5].toUpperCase() : 'SIN DOC';
           
           let codigoDoc = parts[6] || '';
           let observaciones = parts[7] || '';

           // --- CORRECCIÓN INTELIGENTE PARA COLUMNAS DESPLAZADAS ---
           // Si es SIN DOC, usualmente no hay código. Si la columna 6 tiene texto largo, es probable que sea la observación.
           if (documento === 'SIN DOC') {
             // Si observaciones está vacío Y codigoDoc tiene texto (y parece una frase larga > 15 chars), asumimos desplazamiento
             if (!observaciones && codigoDoc.length > 15) {
               observaciones = codigoDoc;
               codigoDoc = '';
             }
             // Asegurar que codigoDoc esté vacío si es SIN DOC
             if (documento === 'SIN DOC') codigoDoc = ''; 
           }

           newItems.push({
             uuid: generateUUID(),
             id,
             zona: bulkZone,
             tipo,
             desc,
             criticidad: ['A','B','C'].includes(criticidad) ? criticidad : 'B',
             estado: ESTADO_OPTS.includes(estado) ? estado : 'EN PROCESO',
             documento: DOC_OPTS.includes(documento) ? documento : 'SIN DOC',
             codigoDoc,
             fechaCierre,
             observaciones
           });
           count++;
        }
      }
    });

    if (count > 0) {
      setData(prev => [...prev, ...newItems]);
      showNotification(`✅ ${count} importados`);
      setBulkText('');
      setShowBulkModal(false);
    } else {
      showNotification("⚠️ Formato inválido. Revise la guía.", "error");
    }
  };

  // --- DESCARGAR EXCEL MODIFICADO ---
  const downloadExcel = () => {
    if (!window.XLSX) {
      alert("Librería Excel no cargada aún. Intenta en unos segundos.");
      return;
    }
    // Mapeo exacto solicitado: ZONA - Código - Descripción - Criticidad - F. Cierre - Estado - Documento - Cód. Doc - Observaciones
    const excelData = data.map(item => ({
      'ZONA': item.zona,
      'Código': `${item.tipo} ${item.id}`,
      'Descripción': item.desc,
      'Criticidad': item.criticidad,
      'F. Cierre': formatDate(item.fechaCierre), // Formato DD/MM/YY
      'Estado': item.estado,
      'Documento': item.documento,
      'Cód. Doc': item.codigoDoc,
      'Observaciones': item.observaciones
    }));

    const ws = window.XLSX.utils.json_to_sheet(excelData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Riesgos");
    window.XLSX.writeFile(wb, "Reporte_Riesgos_MP1.xlsx");
    showNotification("💾 Excel descargado correctamente");
  };

  const downloadJSON = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data_riesgos.json";
    link.click();
    showNotification("💾 Guardado");
  };

  const handleFileUpload = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed)) {
            setData(parsed.map(i => ({...i, uuid: i.uuid || generateUUID()})));
            showNotification("📂 Cargado");
          }
        } catch { alert("Error JSON"); }
      };
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- LOGICA DE FILTRADO CON BÚSQUEDA GLOBAL ---
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      // Si no hay búsqueda, solo filtrar por zona
      return data.filter(item => item.zona === activeTab);
    }
    
    // Si hay búsqueda, buscar en TODO (ignorando zona activa para encontrar en otras)
    return data.filter(item => 
      item.desc.toLowerCase().includes(term) || 
      (item.codigoDoc && item.codigoDoc.toLowerCase().includes(term)) ||
      `${item.tipo} ${item.id}`.toLowerCase().includes(term)
    );
  }, [data, activeTab, searchTerm]);

  // Derivados de filteredData para las listas
  // Ordenar por Zona y luego ID para que en búsqueda global salgan agrupados
  const ldaList = useMemo(() => 
    filteredData
      .filter(d => d.tipo === 'LDA')
      .sort((a, b) => {
        if (a.zona !== b.zona) return ZONE_ORDER[a.zona] - ZONE_ORDER[b.zona];
        return a.id - b.id;
      }), 
  [filteredData]);

  const fcList = useMemo(() => 
    filteredData
      .filter(d => d.tipo === 'FC')
      .sort((a, b) => {
        if (a.zona !== b.zona) return ZONE_ORDER[a.zona] - ZONE_ORDER[b.zona];
        return a.id - b.id;
      }), 
  [filteredData]);

  const chartData = ZONAS.map(z => ({
    name: z,
    LDA: data.filter(d => d.zona === z && d.tipo === 'LDA').length,
    FC: data.filter(d => d.zona === z && d.tipo === 'FC').length
  }));

  // --- VISTA: CARÁTULA (LANDING) ---
  if (appMode === 'cover') {
    return (
      <div 
        className="min-h-screen relative flex flex-col font-sans overflow-hidden transition-colors duration-500 ease-in-out"
        style={{ backgroundColor: theme.bgColor }}
      >
        <div className="absolute top-0 left-0 p-8 z-50">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="group flex items-center justify-center p-3 transition-all duration-500 hover:scale-110"
            style={{ color: theme.titleColor, opacity: 0.3 }}
            title="Acceso Admin"
          >
            <Shield strokeWidth={1} size={32} />
          </button>
        </div>

        <div 
          onClick={() => setAppMode('presentation')}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer group relative"
        >
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{ 
              backgroundImage: `radial-gradient(${theme.titleColor}20 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              opacity: 0.2
            }}
          ></div>

          <div className="text-center z-10 space-y-8 animate-fade-in-up px-4">
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-thin tracking-tighter transition-all duration-700 group-hover:scale-105"
              style={{ color: theme.titleColor }}
            >
              PRESENTACION DE <span className="font-semibold" style={{ color: theme.titleColor }}>LDA/FC</span>
            </h1>
            
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px w-12 transition-all duration-700 group-hover:w-24" style={{ backgroundColor: theme.accentColor }}></div>
              <h2 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase opacity-70" style={{ color: theme.titleColor }}>
                MP1 Cañete
              </h2>
              <div className="h-px w-12 transition-all duration-700 group-hover:w-24" style={{ backgroundColor: theme.accentColor }}></div>
            </div>

            <div className="pt-12 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
              <span 
                className="inline-flex items-center gap-2 text-sm tracking-widest border px-6 py-2 rounded-full font-medium"
                style={{ borderColor: theme.accentColor, color: theme.accentColor }}
              >
                INGRESAR <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm text-center rounded-xl p-8 shadow-2xl">
               <div className="mb-8">
                 <Shield size={48} strokeWidth={1} className="mx-auto text-slate-800 mb-4" />
                 <h2 className="text-2xl font-light text-slate-800">Acceso Administrativo</h2>
               </div>
               <form onSubmit={handleLogin} className="space-y-6">
                 <input 
                   type="password" 
                   autoFocus
                   className="w-full text-center text-3xl tracking-[0.5em] pb-2 border-b border-slate-300 bg-transparent focus:border-slate-800 outline-none text-slate-800 transition-colors"
                   placeholder="••••••"
                   value={passwordInput}
                   onChange={(e) => setPasswordInput(e.target.value)}
                 />
                 <div className="flex justify-center gap-4">
                   <button type="button" onClick={() => setShowAuthModal(false)} className="px-6 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">CANCELAR</button>
                   <button type="submit" className="px-6 py-2 text-sm bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg">ENTRAR</button>
                 </div>
               </form>
            </div>
          </div>
        )}

        <footer className="absolute bottom-6 w-full text-center">
          <p className="text-[10px] tracking-[0.2em] font-medium uppercase opacity-40" style={{ color: theme.titleColor }}>
            Creado por Elias Dolores para la MP1
          </p>
        </footer>
      </div>
    );
  }

  // --- VISTA: APP PRINCIPAL ---
  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: theme.bgColor, color: theme.titleColor }}
    >
      
      {showStats && (
        <AdvancedDashboard 
          data={data} 
          onClose={() => setShowStats(false)} 
          isAdmin={isAdmin}
          onRequestDelete={requestDelete}
          onEditStart={(item) => { startEditingFull(item); setShowStats(false); }}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar Registro?</h3>
            <p className="text-slate-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN LIMPIAR TODO */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Borrar TODO?</h3>
            <p className="text-slate-500 text-sm mb-6">Se eliminarán todos los registros. Esta acción es irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearModal(false)} className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
              <button onClick={handleClearAll} className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200">Sí, Borrar Todo</button>
            </div>
          </div>
        </div>
      )}

      {showThemeModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm relative text-slate-800">
            <button onClick={() => setShowThemeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Palette size={20}/> Diseño & Color</h3>
            
            <div className="mb-6">
              <label className="text-xs uppercase text-slate-400 font-bold block mb-3">Estilos Recomendados</label>
              <div className="grid grid-cols-2 gap-3">
                {PALETTES.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setTheme(p.colors)}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: p.colors.bgColor, border: '1px solid #e2e8f0' }}>
                      <span style={{ color: p.colors.accentColor }}>{p.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <label className="text-xs uppercase text-slate-400 font-bold block mb-1">Personalizado</label>
              {Object.keys(theme).map(k => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex gap-2">
                    <input type="color" value={theme[k]} onChange={(e) => setTheme({...theme, [k]: e.target.value})} className="h-6 w-8 rounded cursor-pointer border-0 p-0"/>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setShowThemeModal(false)} className="mt-6 w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-black">
              Aplicar Cambios
            </button>
          </div>
        </div>
      )}

      {showBulkModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 text-slate-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ClipboardList/> Importar Lista</h3>
            <div className="bg-slate-50 p-2 rounded mb-4 border text-sm">
              <select className="bg-transparent font-bold outline-none w-full" value={bulkZone} onChange={(e) => setBulkZone(e.target.value)}>
                {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="text-[10px] text-slate-500 mb-2 font-mono bg-slate-100 p-2 rounded border">
              FORMATO: CODIGO - DESCRIPCION - CRITICIDAD - F. CIERRE - ESTADO - TIPO DOC - CODIGO DOC - OBSERVACIONES
            </div>
            <textarea className="w-full h-64 p-3 border rounded font-mono text-xs resize-none focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder={`LDA 1 - Bandeja de goma centro - A - 25/04/25 - EJECUTADO - LILA - LILA-FA-MP-006 - Acceso limitado por ubicación y equipo en proceso.`} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
              <button onClick={processBulkText} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Procesar</button>
            </div>
          </div>
        </div>
      )}

      <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-black/5" style={{ backgroundColor: theme.headerColor }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#000000', fontFamily: "'Raleway', sans-serif" }}>
            {isAdmin ? <Lock size={18} className="text-red-500"/> : <Activity size={18} style={{ color: theme.accentColor }}/>}
            <span className="tracking-tight">{isAdmin ? 'ADMINISTRADOR' : 'VISUALIZACIÓN'}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

          {/* Botón Cargar JSON disponible para todos */}
          <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Cargar JSON" style={{ color: theme.titleColor }}><Upload size={18}/></button>

          {isAdmin && (
            <>
              {/* Botón Excel SOLO ADMIN */}
              <button onClick={downloadExcel} className="p-2 hover:bg-green-50 rounded-full transition-colors group" title="Descargar Excel">
                <FileSpreadsheet size={18} className="text-green-600 group-hover:scale-110 transition-transform"/>
              </button>

              <button onClick={() => setShowThemeModal(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Tema" style={{ color: theme.titleColor }}><Palette size={18}/></button>
              <button onClick={() => setShowBulkModal(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Importar Lista" style={{ color: theme.titleColor }}><ClipboardList size={18}/></button>
              <button onClick={downloadJSON} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Guardar JSON" style={{ color: theme.accentColor }}><Save size={18}/></button>
              
              {/* Botón Limpiar Todo SOLO ADMIN */}
              <button onClick={() => setShowClearModal(true)} className="p-2 hover:bg-red-50 rounded-full transition-colors group" title="Limpiar Todo">
                <Trash2 size={18} className="text-red-500 group-hover:scale-110 transition-transform"/>
              </button>
            </>
          )}
          
          <button 
            onClick={() => setShowStats(!showStats)} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-2 shadow-sm hover:shadow-md" 
            title="Estadísticas"
          >
            <BarChart2 size={18}/>
            <span className="text-xs font-bold">Gráficos Estadísticos</span>
          </button>
          
          <button onClick={handleLogout} className="ml-4 px-4 py-1.5 text-xs font-bold border border-black/10 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors" style={{ color: theme.titleColor }}>
            SALIR
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* PANEL IZQUIERDO (FORMULARIO ADMIN) */}
        {isAdmin && (
          <div className={`lg:w-80 border-r border-black/5 bg-white/50 overflow-y-auto p-6 animate-slide-right backdrop-blur-sm text-slate-800 transition-colors duration-300 ${editingItemUuid ? 'bg-yellow-50/80 border-yellow-200' : ''}`}>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${editingItemUuid ? 'text-yellow-700' : 'text-slate-400'}`}>
                {editingItemUuid ? <Edit3 size={14}/> : <PlusCircle size={14}/>} 
                {editingItemUuid ? 'Editando Registro' : 'Nuevo Ingreso'}
              </h2>
              {editingItemUuid && (
                <button onClick={resetForm} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold"><Undo2 size={12}/> Cancelar</button>
              )}
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</label>
                <div className="grid grid-cols-2 gap-2">
                  <select className="w-full text-sm border rounded p-2 bg-white/80" value={newItem.zona} onChange={e => {setNewItem({...newItem, zona: e.target.value}); setActiveTab(e.target.value);}}>
                    {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                  <select className="w-full text-sm border rounded p-2 bg-white/80" value={newItem.tipo} onChange={e => setNewItem({...newItem, tipo: e.target.value})}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Clasificación</label>
                <div className="flex gap-1">
                  {CRITICIDAD_OPTS.map(opt => (
                    <button type="button" key={opt} onClick={() => setNewItem({...newItem, criticidad: opt})} 
                      className={`flex-1 py-1 text-xs font-bold rounded border ${newItem.criticidad === opt ? 'bg-slate-800 text-white border-slate-800' : 'bg-white/80 text-slate-400'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-1 mt-2">
                  {ESTADO_OPTS.map(opt => (
                    <label key={opt} className={`flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer text-xs ${newItem.estado === opt ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white/80 border-slate-100 text-slate-400'}`}>
                      <input type="radio" name="est" checked={newItem.estado === opt} onChange={() => setNewItem({...newItem, estado: opt})} className="accent-blue-600"/>
                      <span className="font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nuevos Campos en Formulario: Fecha y Observaciones */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cierre / Detalles</label>
                <div className="grid grid-cols-2 gap-2">
                  {/* CAMBIO: Input type="text" para permitir solo Año (ej: 2025) o fecha completa */}
                  <input type="text" className="text-xs border rounded p-2 bg-white/80" placeholder="YYYY-MM-DD o Año (2025)"
                    value={newItem.fechaCierre || ''} onChange={e => setNewItem({...newItem, fechaCierre: e.target.value})}/>
                  <select className="text-xs border rounded p-2 bg-white/80" value={newItem.documento} onChange={e => setNewItem({...newItem, documento: e.target.value})}>
                    {DOC_OPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <input type="text" className={`w-full text-xs border rounded p-2 ${newItem.documento === 'SIN DOC' ? 'opacity-50 bg-slate-100' : 'bg-white/80'}`}
                    placeholder="Código documento..." disabled={newItem.documento === 'SIN DOC'} value={newItem.codigoDoc || ''} onChange={e => setNewItem({...newItem, codigoDoc: e.target.value})}/>
                <textarea className="w-full text-xs border rounded p-2 h-16 bg-white/80 resize-none focus:ring-1 focus:ring-blue-500 outline-none mt-2" 
                  placeholder="Observaciones de cierre o detalles adicionales..." value={newItem.observaciones || ''} onChange={e => setNewItem({...newItem, observaciones: e.target.value})}/>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción Principal</label>
                <textarea className="w-full text-sm border rounded p-3 h-24 bg-white/80 resize-none focus:ring-1 focus:ring-blue-500 outline-none" 
                  placeholder="Descripción del hallazgo..." value={newItem.desc || ''} onChange={e => setNewItem({...newItem, desc: e.target.value})}/>
              </div>
              
              <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg text-sm transition-colors ${editingItemUuid ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200' : 'bg-slate-900 hover:bg-black'}`}>
                {editingItemUuid ? 'Actualizar Registro' : 'Guardar Registro'}
              </button>
            </form>
            
            {!editingItemUuid && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                  <button onClick={renumberData} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 border border-dashed rounded hover:bg-slate-50">Re-ordenar IDs</button>
              </div>
            )}
          </div>
        )}

        {/* PANEL DERECHO (LISTADO) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/30 backdrop-blur-sm">
          
          {/* BARRA DE NAVEGACIÓN Y BÚSQUEDA */}
          <div className="flex flex-wrap gap-4 p-4 border-b border-black/5 bg-white/40 backdrop-blur-md sticky top-0 z-10 items-center justify-between">
            {/* TABS NAVEGACIÓN */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {ZONAS.map(zona => (
                <button 
                  key={zona} 
                  onClick={() => { setActiveTab(zona); setSearchTerm(''); }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all transform hover:scale-105 shadow-sm`}
                  style={{ 
                    backgroundColor: activeTab === zona ? theme.tabColor : 'rgba(255,255,255,0.6)',
                    color: activeTab === zona ? '#ffffff' : theme.titleColor,
                    border: activeTab === zona ? 'none' : '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  {zona}
                  <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === zona ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500'}`}>
                    {data.filter(d => d.zona === zona).length}
                  </span>
                </button>
              ))}
            </div>

            {/* BUSCADOR */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar en todas las zonas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full border border-black/10 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64 transition-all"
              />
            </div>
          </div>

          {/* COLUMNAS DATOS */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* LDA */}
              <div className="space-y-4">
                <div className="bg-[#86efac] text-black p-3 rounded-lg shadow-md mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                  <MapPin size={18}/> Lugares Difícil Acceso
                </div>
                {ldaList.map(item => <Card key={item.uuid} item={item} isAdmin={isAdmin} onRequestDelete={requestDelete} onEditStart={startEditingFull}/>)}
              </div>
              
              {/* FC */}
              <div className="space-y-4">
                <div className="bg-[#fef08a] text-black p-3 rounded-lg shadow-md mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                  <Activity size={18}/> Fuentes Contaminación
                </div>
                {fcList.map(item => <Card key={item.uuid} item={item} isAdmin={isAdmin} onRequestDelete={requestDelete} onEditStart={startEditingFull}/>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-full shadow-2xl animate-fade-in-up flex items-center gap-3 z-50 text-sm font-medium ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
          {notification.msg}
        </div>
      )}

      {/* FOOTER APP */}
      <div className="fixed bottom-0 w-full text-center py-2 text-[10px] uppercase tracking-widest pointer-events-none bg-gradient-to-t from-white/20 to-transparent" style={{ color: theme.titleColor, opacity: 0.4 }}>
        Creado por Elias Dolores para la MP1
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700;900&display=swap');
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

// --- TARJETA INDIVIDUAL (INTERACTIVA) ---
const Card = ({ item, isAdmin, onRequestDelete, onEditStart }) => {
  const [expanded, setExpanded] = useState(false);
  const colorClass = item.tipo === 'LDA' ? 'bg-[#86efac] text-black border-[#4ade80]' : 'bg-[#fef08a] text-black border-[#facc15]';
  
  // Manejador de clic principal para expandir/colapsar
  const handleCardClick = () => {
    // Si es admin, no expandimos con clic simple si queremos que doble clic edite.
    // Pero el requerimiento dice: "PERO ESTAS EN EL MODO DE VOSULAIZACION SE DESPELGARAN CUANDO SE HAGA CLICK"
    // Podemos permitir expandir siempre con clic simple.
    setExpanded(!expanded);
  };

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm border border-black/5 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:border-black/10 cursor-pointer ${expanded ? 'shadow-lg ring-1 ring-black/5' : ''}`}
      onClick={handleCardClick}
      onDoubleClick={(e) => { e.stopPropagation(); isAdmin && onEditStart(item); }}
    >
      <div className="flex gap-4 items-start">
        <div className="flex flex-col items-center gap-1 min-w-[3rem]">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${colorClass}`}>
            {item.tipo} {item.id}
          </span>
          <span className={`text-[9px] font-bold w-full text-center px-1 rounded ${item.criticidad === 'A' ? 'bg-red-100 text-red-600' : item.criticidad === 'B' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
            {item.criticidad}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
              item.estado === 'ATRASADO' ? 'text-red-500 bg-red-50' : 
              item.estado === 'EJECUTADO' ? 'text-green-500 bg-green-50' : 
              item.estado === 'PENDIENTE' ? 'text-slate-500 bg-slate-100' :
              'text-blue-500 bg-blue-50'
            }`}>
              {item.estado}
            </span>
            {item.documento !== 'SIN DOC' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-slate-500 flex items-center gap-1">
                <FileText size={8}/> {item.documento} {item.codigoDoc && <span className="opacity-50">| {item.codigoDoc}</span>}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {item.desc}
          </p>
        </div>
      </div>

      {/* SECCIÓN DESPLEGABLE */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-100 animate-fade-in">
           <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-2">
              <div className="flex items-center gap-2">
                 <Calendar size={12} className="text-slate-400"/> 
                 <span className="font-bold">Cierre:</span> {formatDate(item.fechaCierre) || 'No definida'}
              </div>
           </div>
           {/* Protección contra objetos no string en observaciones */}
           {item.observaciones && (
             <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 italic border border-slate-100 flex gap-2">
                <MessageSquare size={12} className="mt-0.5 text-slate-400 flex-shrink-0"/>
                {String(item.observaciones)}
             </div>
           )}
           {!item.observaciones && !item.fechaCierre && (
             <div className="text-center text-[10px] text-slate-300 italic py-1">Sin detalles adicionales</div>
           )}
        </div>
      )}
      
      {isAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEditStart(item); }} 
            className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
            title="Editar completo"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRequestDelete(item.uuid); }} 
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};