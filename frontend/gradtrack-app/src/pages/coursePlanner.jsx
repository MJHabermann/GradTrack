import React, { useEffect, useState, useRef } from "react";
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import axios from "axios";
import './coursePlanner.css'

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

export default function CoursePlanner() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [planned, setPlanned] = useState([]); 
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [terms, setTerms] = useState([]); 
    const [nextTermId, setNextTermId] = useState(1);
    const termsRowRef = useRef(null);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [, setIsDragging] = useState(false);
    //query student ID from auth context or similar in real app
    const studentId = 1;

    useEffect(() => {
        api
            .get('/courses')
            .then(res => setCourses(res.data || []))
            .catch(err => console.error('Failed to load courses', err));
    }, []);

    const filtered = courses.filter(c => {
        if (!search) return true;
        return (
            c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
            c.title?.toLowerCase().includes(search.toLowerCase())
        );
    });

    function handleAddPlanned(course) {
        if (planned.find(p => p.id === course.id)) return;
        setPlanned(prev => [...prev, course]);
    }

    function handleRemovePlanned(courseId) {
        setPlanned(prev => prev.filter(c => c.id !== courseId));
    }

    function handleAddTerm(season, year) {
        const id = nextTermId;
        setNextTermId(id + 1);
        setTerms(prev => [...prev, { id, season, year, courses: [] }]);
    }
    function onDragStart(e, course, source) {
        e.dataTransfer.setData('application/json', JSON.stringify({ course, source }));
    }

    function onDropToTerm(e, termId) {
        e.preventDefault();
        const payload = JSON.parse(e.dataTransfer.getData('application/json'));
        const course = payload.course;
        const source = payload.source;

        setTerms(prev => {
            const cleaned = prev.map(t => ({ ...t, courses: t.courses.filter(c => c.id !== course.id) }));
            return cleaned.map(t => t.id === termId ? { ...t, courses: [...t.courses, course] } : t);
        });
        if (source === 'planned') {
            handleRemovePlanned(course.id);
        }
    }

    function onDropToPlanned(e) {
        e.preventDefault();
        const payload = JSON.parse(e.dataTransfer.getData('application/json'));
        const course = payload.course;
        const source = payload.source;

        if (source !== 'planned') {
            setTerms(prev => prev.map(t => ({ ...t, courses: t.courses.filter(c => c.id !== course.id) })));
            setPlanned(prev => prev.find(p => p.id === course.id) ? prev : [...prev, course]);
        }
    }

    function allowDrop(e) { e.preventDefault(); }
    function onTermsMouseDown(e) {
        const el = termsRowRef.current;
        if (!el) return;
        isDownRef.current = true;
        setIsDragging(true);
        el.classList.add('dragging');
        startXRef.current = e.pageX - el.offsetLeft;
        scrollLeftRef.current = el.scrollLeft;
    }

    function onTermsMouseMove(e) {
        const el = termsRowRef.current;
        if (!el || !isDownRef.current) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startXRef.current) * 1;
        el.scrollLeft = scrollLeftRef.current - walk;
    }

    function onTermsMouseUp() {
        const el = termsRowRef.current;
        isDownRef.current = false;
        setIsDragging(false);
        if (el) el.classList.remove('dragging');
    }

    function onTermsTouchStart(e){
        const el = termsRowRef.current;
        if (!el) return;
        isDownRef.current = true;
        startXRef.current = e.touches[0].pageX - el.offsetLeft;
        scrollLeftRef.current = el.scrollLeft;
    }

    function onTermsTouchMove(e){
        const el = termsRowRef.current;
        if (!el || !isDownRef.current) return;
        const x = e.touches[0].pageX - el.offsetLeft;
        const walk = (x - startXRef.current) * 1;
        el.scrollLeft = scrollLeftRef.current - walk;
    }

    function onTermsTouchEnd(){
        isDownRef.current = false;
    }

    async function handleSave() {
        if (terms.length === 0) {
            alert('No terms to save');
            return;
        }

        try {
            for (let t of terms) {
                const name = `${t.season} ${t.year}`;
                const termRes = await api.post(`/students/${studentId}/terms`, { name });
                const termId = termRes.data.term.id;
                for (let c of t.courses) {
                    try {
                        await api.post(`/students/${studentId}/terms/${termId}/courses`, { course_id: c.id });
                    } catch (err) {
                        console.error('Failed to add course', c, err.response?.data || err.message);
                    }
                }
            }

            alert('Schedule saved successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to save schedule. See console for details.');
        }
    }

return (
  <>
    <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    <Navbar sidebarOpen={sidebarOpen} />
    <main style={{ paddingLeft: sidebarOpen ? '20rem' : '5rem' }}>
    <div className="course-planner-page">
      <div className="planner-header">
        <h2>Course Planner</h2>
        <p className="planner-subtitle">Organize courses into terms and visualize your academic path</p>
      </div>

      <div className="planner-grid">
        <div className="planner-left">

          {/* Search Courses */}
          <section className="search-section card">
            <h3>Search Courses</h3>
            <input
              className="search-input"
              type="text"
              placeholder="Search by code or title"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {!search && (
              <div className="placeholder">Type to search courses to see results</div>
            )}
            {search && filtered.length === 0 && (
              <div className="no-results">No courses found for "{search}"</div>
            )}

            {search && filtered.length > 0 && (
              <div className="search-results">
                {filtered.map(c => (
                  <div key={c.id} className="course-item">
                    <div className="course-meta">
                      <strong>{c.course_code}</strong>
                      <div className="course-title">{c.title}</div>
                    </div>
                    <div className="course-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => handleAddPlanned(c)}>Add</button>
                      <div className="drag-handle" draggable onDragStart={e => onDragStart(e, c, 'search')}>☰</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Planned Courses */}
            <section className="planned-section card" onDragOver={allowDrop} onDrop={onDropToPlanned}>
            <h3>Planned Courses</h3>

            {planned.length === 0 && (
                <div className="no-search-placeholder">
                Drag Courses Here or Click Add
                </div>
            )}

            <div className="planned-area">
                {planned.map(c => (
                <div key={c.id} className="planned-item" draggable onDragStart={e => onDragStart(e, c, 'planned')}>
                    <div className="planned-meta">{c.course_code} — {c.title}</div>
                    <div className="planned-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => handleRemovePlanned(c.id)}>Remove</button>
                    <div className="drag-handle">☰</div>
                    </div>
                </div>
                ))}
            </div>
            </section>


          {/* Term Controls */}
          <section className="term-controls card">
            <h3>Create Term</h3>
            <TermCreator onAdd={handleAddTerm} />
            <div className="save-actions">
              <button className="btn btn-primary" onClick={handleSave}>Save Schedule</button>
            </div>
          </section>

          {/* Terms Row */}
          <section className="terms-row-container card">
            <h3>Terms</h3>
            <div
              className="terms-row"
              ref={termsRowRef}
              onMouseDown={onTermsMouseDown}
              onMouseMove={onTermsMouseMove}
              onMouseUp={onTermsMouseUp}
              onMouseLeave={onTermsMouseUp}
              onTouchStart={onTermsTouchStart}
              onTouchMove={onTermsTouchMove}
              onTouchEnd={onTermsTouchEnd}
            >
              {terms.length === 0 && <div className="placeholder">No terms yet. Add one above.</div>}
              {terms.map(t => (
                <div key={t.id} className="term-card" onDragOver={allowDrop} onDrop={e => onDropToTerm(e, t.id)}>
                  <div className="term-header"><strong>{t.season} {t.year}</strong></div>
                  <div className="term-courses">
                    {t.courses.length === 0 && <div className="placeholder">Drop planned courses here</div>}
                    {t.courses.map(c => (
                      <div key={c.id} className="term-course" draggable onDragStart={e => onDragStart(e, c, t.id)}>
                        <div>{c.course_code} — {c.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
        </div>
        </div>
    </main>
    </>
);
}


function TermCreator({ onAdd }) {
    const [season, setSeason] = useState('Fall');
    const [year, setYear] = useState(2025);

    const years = [];
    for (let y = 2025; y <= 2100; y++) years.push(y);

    function handleAdd() {
        onAdd(season, year);
    }

    return (
        <div className="term-creator-form">
            <select value={season} onChange={e => setSeason(e.target.value)}>
                <option>Fall</option>
                <option>Spring</option>
                <option>Summer</option>
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value, 10))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={handleAdd}>Add Term</button>
        </div>
    );
}
