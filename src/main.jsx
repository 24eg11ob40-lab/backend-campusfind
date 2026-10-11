import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Plus, MapPin, Clock3, PackageOpen, X, Trash2, RefreshCw } from 'lucide-react';
import './style.css';

const API = 'http://localhost:8080/api/items';
const emptyForm = { title: '', description: '', category: 'Other', location: '', contact: '', status: 'LOST' };

function App() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      setItems(await res.json());
    } catch {
      setError('Cannot connect to the backend. Start Spring Boot in the backend folder, then refresh.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  const visibleItems = useMemo(() => items.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const haystack = [item.title, item.description, item.category, item.location].join(' ').toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [items, query, filter]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Could not save item');
      }
      setForm(emptyForm);
      setShowForm(false);
      await loadItems();
    } catch (err) {
      setError(err.message || 'Could not save item. Check that the backend is running.');
    }
  }

  async function removeItem(id) {
    if (!window.confirm('Delete this listing?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(item => item.id !== id));
    } catch {
      setError('Could not delete this listing. Check the backend connection.');
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><PackageOpen size={22}/></span><span>Campus<span className="brand-accent">Find</span></span></a>
        <div className="top-actions"><span className="campus-label">Campus community</span><button className="primary small" onClick={() => setShowForm(true)}><Plus size={17}/> Post an item</button></div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><span className="eyebrow-dot"/> LOST SOMETHING? FOUND SOMETHING?</div>
          <h1>Lost it. Found it.<br/><span>Bring it back together.</span></h1>
          <p>A simple place for your campus community to report lost belongings and reunite found items with their owners.</p>
          <div className="search-wrap"><Search size={20}/><input aria-label="Search listings" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by item, category, or location..."/>{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="Clear search"><X size={17}/></button>}</div>
          <div className="quick-stats"><span><strong>{items.length}</strong> listings</span><span className="stat-divider"/><span><strong>{items.filter(i => i.status === 'FOUND').length}</strong> found items</span><span className="stat-divider"/><span><strong>{items.filter(i => i.status === 'LOST').length}</strong> lost items</span></div>
        </section>

        <section className="listings-section">
          <div className="section-head"><div><div className="eyebrow muted">CAMPUS BOARD</div><h2>Community listings</h2></div><button className="secondary" onClick={loadItems}><RefreshCw size={15}/> Refresh</button></div>
          <div className="filters">
            {[['ALL', 'All items'], ['LOST', 'Lost items'], ['FOUND', 'Found items']].map(([value, label]) => <button key={value} className={`filter ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{label}<span>{value === 'ALL' ? items.length : items.filter(i => i.status === value).length}</span></button>)}
          </div>

          {error && <div className="notice" role="alert">{error}</div>}
          {loading ? <div className="empty-state"><div className="loader"/><p>Loading campus listings…</p></div> :
            visibleItems.length === 0 ? <div className="empty-state"><div className="empty-icon"><PackageOpen size={27}/></div><h3>{query ? 'No matching items' : 'No listings yet'}</h3><p>{query ? 'Try another search term.' : 'Be the first to post a lost or found item.'}</p><button className="primary" onClick={() => setShowForm(true)}><Plus size={17}/> Post an item</button></div> :
            <div className="cards">{visibleItems.map(item => <article className="item-card" key={item.id}>
              <div className="card-top"><span className={`status ${item.status === 'FOUND' ? 'found' : 'lost'}`}>{item.status === 'FOUND' ? 'Found item' : 'Lost item'}</span><button className="icon-button delete-button" title="Delete listing" onClick={() => removeItem(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={16}/></button></div>
              <h3>{item.title}</h3><p className="description">{item.description || 'No description provided.'}</p>
              <div className="meta"><span><PackageOpen size={15}/>{item.category || 'Other'}</span><span><MapPin size={15}/>{item.location || 'Location not specified'}</span></div>
              {item.contact && <div className="contact"><span>Contact</span><a href={`mailto:${item.contact}`}>{item.contact}</a></div>}
              <div className="card-footer"><Clock3 size={14}/>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently posted'}</div>
            </article>)}</div>
          }
        </section>
        <footer>Made for a more helpful campus community <span>·</span> CampusFind</footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-head"><div><div className="eyebrow muted">CAMPUS BOARD</div><h2 id="form-title">Post an item</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X/></button></div>
        <form onSubmit={submit} className="item-form">
          <label>Item name *<input required maxLength="150" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Blue water bottle"/></label>
          <label>Description<textarea rows="3" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Add details that can help identify the item"/></label>
          <div className="form-row"><label>Listing type<select value={form.status} onChange={e => setForm({...form, status:e.target.value})}><option value="LOST">I lost this</option><option value="FOUND">I found this</option></select></label><label>Category<select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>{['Electronics','Books','ID Card','Accessories','Clothing','Keys','Other'].map(x=><option key={x}>{x}</option>)}</select></label></div>
          <label>Location<input value={form.location} onChange={e => setForm({...form, location:e.target.value})} placeholder="e.g. Library, Block A"/></label>
          <label>Contact email<input type="email" value={form.contact} onChange={e => setForm({...form, contact:e.target.value})} placeholder="you@example.com"/></label>
          <div className="form-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary"><Plus size={17}/> Publish listing</button></div>
        </form>
      </section></div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
