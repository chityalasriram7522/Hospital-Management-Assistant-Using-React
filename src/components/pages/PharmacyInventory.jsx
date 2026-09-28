import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
    Pill,
    Search,
    AlertTriangle,
    Plus,
    RefreshCw,
    PackageCheck,
    DollarSign,
    Layers
} from 'lucide-react';

export default function PharmacyInventory() {
    const { inventory, setInventory, restockMedicine, addToast } = useHospital();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMed, setNewMed] = useState({
        name: "",
        category: "Analgesic / Antipyretic",
        stock: 100,
        unitPrice: 50,
        unit: "Strips",
        batch: "MED-" + new Date().getFullYear(),
        expiry: "12/2028"
    });

    const categories = [
        "All",
        "Analgesic / Antipyretic",
        "Antibiotic",
        "Cardiovascular / Antiplatelet",
        "Cardiovascular / Nitrate",
        "Antihistamine",
        "NSAID / Anti-inflammatory",
        "Electrolytes",
        "Antacid / PPI",
        "Low Stock Alerts"
    ];

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.batch.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedCategory === "All") return matchesSearch;
        if (selectedCategory === "Low Stock Alerts") {
            return matchesSearch && (item.stock < 50 || item.status === "Low Stock" || item.status === "Out of Stock");
        }
        return matchesSearch && item.category === selectedCategory;
    });

    // Stats calculations
    const totalUnits = inventory.reduce((acc, curr) => acc + curr.stock, 0);
    const totalValuation = inventory.reduce((acc, curr) => acc + (curr.stock * curr.unitPrice), 0);
    const lowStockCount = inventory.filter(i => i.stock < 50 || i.status === "Low Stock").length;
    const outOfStockCount = inventory.filter(i => i.stock === 0 || i.status === "Out of Stock").length;

    const handleAddNewMedicine = (e) => {
        e.preventDefault();
        if (!newMed.name.trim()) {
            addToast("Please provide medicine name.", "warning");
            return;
        }

        const stockNum = parseInt(newMed.stock) || 0;
        const itemToAdd = {
            id: Date.now(),
            name: newMed.name.trim(),
            category: newMed.category,
            stock: stockNum,
            unitPrice: parseFloat(newMed.unitPrice) || 20,
            unit: newMed.unit || "Strips",
            batch: newMed.batch || ("MED-" + Math.floor(1000 + Math.random() * 9000)),
            expiry: newMed.expiry || "12/2028",
            status: stockNum === 0 ? "Out of Stock" : stockNum < 50 ? "Low Stock" : "In Stock"
        };

        setInventory(prev => [itemToAdd, ...prev]);
        addToast(`Successfully added ${itemToAdd.name} to pharmacy stock!`, "success");
        setShowAddModal(false);
        setNewMed({
            name: "",
            category: "Analgesic / Antipyretic",
            stock: 100,
            unitPrice: 50,
            unit: "Strips",
            batch: "MED-" + new Date().getFullYear(),
            expiry: "12/2028"
        });
    };

    return (
        <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top Bar Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <Pill size={18} />
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.25em]">
                            Central Medical Dispensary
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase">
                        Pharmacy Drug Inventory & Stock Management
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Real-time tracking of pharmacological supplies, batch registries, expiration monitoring, and automated dispensary syncing.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                        <Plus size={16} /> Add New Medicine
                    </button>
                </div>
            </div>

            {/* KPI Metrics Scoreboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Total Formularies</span>
                        <span className="p-2 bg-blue-600/10 text-blue-400 rounded-xl"><Layers size={16} /></span>
                    </div>
                    <div className="text-2xl font-black text-white font-mono">{inventory.length} SKUs</div>
                    <span className="text-[10px] text-zinc-400">Approved hospital pharmaceutical stock</span>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Units in Warehouse</span>
                        <span className="p-2 bg-emerald-600/10 text-emerald-400 rounded-xl"><PackageCheck size={16} /></span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{totalUnits.toLocaleString()}</div>
                    <span className="text-[10px] text-zinc-400">Total units readily available</span>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Low Stock Watchlist</span>
                        <span className="p-2 bg-amber-600/10 text-amber-400 rounded-xl"><AlertTriangle size={16} /></span>
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-mono">{lowStockCount} Meds</div>
                    <span className="text-[10px] text-amber-400/80">{lowStockCount} low • {outOfStockCount} depleted (Reorder suggested)</span>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Inventory Valuation</span>
                        <span className="p-2 bg-purple-600/10 text-purple-400 rounded-xl"><DollarSign size={16} /></span>
                    </div>
                    <div className="text-2xl font-black text-purple-400 font-mono">₹{totalValuation.toLocaleString()}</div>
                    <span className="text-[10px] text-zinc-400">Hospital dispensary retail estimate</span>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-zinc-950/70 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search medicines by name, classification, or batch number..."
                        className="w-full bg-zinc-900/90 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {categories.slice(0, 5).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                selectedCategory === cat
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedCategory("Low Stock Alerts")}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                            selectedCategory === "Low Stock Alerts"
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                        }`}
                    >
                        <AlertTriangle size={12} /> Low Stock ({lowStockCount})
                    </button>
                </div>
            </div>

            {/* Inventory Table / Catalog */}
            <div className="bg-zinc-950/70 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <th className="p-4 pl-6">Medicine & Dosage</th>
                                <th className="p-4">Therapeutic Category</th>
                                <th className="p-4">Batch / Expiry</th>
                                <th className="p-4">Stock Level</th>
                                <th className="p-4">Unit Rate</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Quick Restock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-zinc-500">
                                        <Pill size={36} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-xs uppercase tracking-wider font-bold">No pharmacological items matched your query</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map(item => {
                                    const isLow = item.stock < 50;
                                    const isOut = item.stock === 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-xl border ${
                                                        isOut ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        isLow ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                        <Pill size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 font-mono">
                                                            Packaging: {item.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-semibold">
                                                    {item.category}
                                                </span>
                                            </td>

                                            <td className="p-4 font-mono text-zinc-400">
                                                <div className="text-white font-bold text-[11px]">{item.batch}</div>
                                                <div className="text-[10px] text-zinc-500">Exp: {item.expiry}</div>
                                            </td>

                                            <td className="p-4">
                                                <div className="space-y-1.5 w-36">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className={`font-mono font-bold ${
                                                            isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                                                        }`}>
                                                            {item.stock} {item.unit}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500">Max: 500</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${
                                                                isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, (item.stock / 500) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 font-mono font-bold text-white">
                                                ₹{item.unitPrice} <span className="text-[10px] text-zinc-500 font-normal">/ {item.unit.replace(/s$/, '')}</span>
                                            </td>

                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                                    isOut ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    isLow ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                    {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>

                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => restockMedicine(item.id, 50)}
                                                        title="Restock 50 units"
                                                        className="px-2.5 py-1.5 bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-white/10 rounded-lg text-emerald-400 text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <RefreshCw size={11} /> +50
                                                    </button>
                                                    <button
                                                        onClick={() => restockMedicine(item.id, 100)}
                                                        title="Restock 100 units"
                                                        className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 rounded-lg text-emerald-300 text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                                                    >
                                                        +100
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add New Medicine Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                                    Dispensary Master File
                                </span>
                                <h3 className="text-xl font-black text-white italic uppercase">
                                    Add New Drug to Formulary
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddNewMedicine} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                    Drug Brand / Chemical Name & Strength
                                </label>
                                <input
                                    required
                                    value={newMed.name}
                                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                    placeholder="e.g. Azithromycin 500mg"
                                    className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                        Therapeutic Class
                                    </label>
                                    <select
                                        value={newMed.category}
                                        onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                                    >
                                        <option value="Analgesic / Antipyretic">Analgesic / Antipyretic</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Cardiovascular / Antiplatelet">Cardiovascular</option>
                                        <option value="Antihistamine">Antihistamine</option>
                                        <option value="NSAID / Anti-inflammatory">NSAID</option>
                                        <option value="Electrolytes">Electrolytes</option>
                                        <option value="Antacid / PPI">Antacid / PPI</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                        Unit Packaging
                                    </label>
                                    <input
                                        value={newMed.unit}
                                        onChange={(e) => setNewMed({ ...newMed, unit: e.target.value })}
                                        placeholder="e.g. Strips, Bottles"
                                        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                        Initial Quantity Units
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newMed.stock}
                                        onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                        Unit Retail Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newMed.unitPrice}
                                        onChange={(e) => setNewMed({ ...newMed, unitPrice: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                        Batch Number
                                    </label>
                                    <input
                                        value={newMed.batch}
                                        onChange={(e) => setNewMed({ ...newMed, batch: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                                        Expiry Date
                                    </label>
                                    <input
                                        value={newMed.expiry}
                                        onChange={(e) => setNewMed({ ...newMed, expiry: e.target.value })}
                                        placeholder="MM/YYYY"
                                        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
                            >
                                Register Drug in Inventory
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
