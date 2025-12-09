import React, { useEffect, useState, useRef } from "react";
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PrerequisiteModal from '../components/PrerequisiteModal';
import axios from "axios";
import './coursePlanner.css'

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function CoursePlanner() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [planned, setPlanned] = useState([]); 
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [terms, setTerms] = useState([]); 
    const [nextTermId, setNextTermId] = useState(1);
    const [removedCourses, setRemovedCourses] = useState([]);
    const termsRowRef = useRef(null);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [showPrereqModal, setShowPrereqModal] = useState(false);
    const [studentId, setStudentId] = useState(null);
    const [completedPrerequisites, setCompletedPrerequisites] = useState([]);

    useEffect(() => {
        api
            .get('/courses')
            .then(res => setCourses(res.data || []))
            .catch(err => console.error('Failed to load courses', err));
        
        api 
            .get('/me')
            .then(res => {
                const student = res.data.user?.student;
                if (student && student.student_id) {
                    setStudentId(student.student_id);
                } else {
                    console.error('No student record found for authenticated user');
                }
            })
            .catch(err => console.error('Failed to load user info', err));
    }, []);

    useEffect(() => {
        if (!studentId) return;
        
        api
            .get(`/students/${studentId}/schedule`)
            .then(res => {
              const savedTerms = res.data || [];
              
              const transformedTerms = savedTerms.map((term) => {
                return {
                  id: term.id,
                  season: term.name?.split(' ')[0] || 'Fall',
                  year: parseInt(term.name?.split(' ')[1]) || new Date().getFullYear(),
                  courses: term.courses || [],
                  isNew: false,
                  savedCourseIds: (term.courses || []).map(c => c.id)
                };
              });
              
              setTerms(transformedTerms);
              if (transformedTerms.length > 0) {
                setNextTermId(Math.max(...transformedTerms.map(t => t.id)) + 1);
              }
            })
            .catch(err => console.error('Failed to load terms', err));
        
        const prereqCompleted = localStorage.getItem(`prereq_modal_completed_${studentId}`);
        if (prereqCompleted) {
            setShowPrereqModal(false);
        }
        
        api
            .get(`/students/${studentId}/enrollments`)
            .then(res => {
              const enrollments = res.data || [];
              const hasCompleted = enrollments.some(e => e.status === 'completed');
              
              const completed = enrollments
                .filter(e => e.status === 'completed')
                .map(e => e.course)
                .filter(Boolean);
              setCompletedPrerequisites(completed);
              
              if (!hasCompleted && !prereqCompleted) {
                setShowPrereqModal(true);
              }
            })
            .catch(err => console.error('Failed to load enrollments', err));
    }, [studentId]);

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
        const termName = `${season} ${year}`;
        
        if (terms.find(t => `${t.season} ${t.year}` === termName)) {
            alert(`A term named "${termName}" already exists. Please choose a different season or year.`);
            return;
        }
        
        const id = nextTermId;
        setNextTermId(id + 1);
        setTerms(prev => [...prev, { id, season, year, courses: [], isNew: true, savedCourseIds: [] }]);
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
        
        if (source !== 'planned' && source !== 'search') {
            setRemovedCourses(prev => [...prev, { termId: source, courseId: course.id }]);
        }
        
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

            if (source !== 'search') {
                setRemovedCourses(prev => [...prev, { termId: source, courseId: course.id }]);
            }
        }
    }

    function allowDrop(e) { e.preventDefault(); }
    function onTermsMouseDown(e) {
        const el = termsRowRef.current;
        if (!el) return;
        isDownRef.current = true;
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
        if (!studentId) {
            alert('Student ID not loaded. Please refresh the page.');
            return;
        }
        if (terms.length === 0) {
            alert('No terms to save');
            return;
        }
        try {
            for (let removed of removedCourses) {
                try {
                    await api.delete(`/students/${studentId}/terms/${removed.termId}/courses/${removed.courseId}`);
                } catch (err) {
                    console.error('Failed to remove course', err);
                }
            }
            setRemovedCourses([]);

            for (let t of terms) {
                const name = `${t.season} ${t.year}`;
                let termId = t.id;

                if (t.isNew) {
                    try {
                        const termRes = await api.post(`/students/${studentId}/terms`, { name });
                        termId = termRes.data.term.id;
                    } catch (err) {
                        if (err.response?.status === 422) {
                            alert(`Error: ${err.response.data.message}`);
                            return;
                        }
                        throw err;
                    }
                }
                const savedCourseIds = t.savedCourseIds || [];
                for (let c of t.courses) {
                    if (savedCourseIds.includes(c.id)) {
                        continue;
                    }
                    
                    try {
                        await api.post(`/students/${studentId}/terms/${termId}/courses`, { course_id: c.id });
                    } catch (err) {
                        const errorData = err.response?.data;
                        if (err.response?.status === 400 && errorData?.missing) {
                            // Prerequisites not satisfied
                            const missingCourses = errorData.missing.map(group => 
                                group.map(course => `${course.course_code} - ${course.title}`).join(' OR ')
                            ).join(', ');
                            alert(`Cannot add ${c.course_code}: Prerequisites not satisfied. You need: ${missingCourses}`);
                            return;
                        }
                        console.error('Failed to add course', c, errorData || err.message);
                        alert(`Failed to add course ${c.course_code}: ${errorData?.message || err.message}`);
                        return;
                    }
                }
            }
            const reloadRes = await api.get(`/students/${studentId}/schedule`);
            const savedTerms = reloadRes.data || [];
            const transformedTerms = savedTerms.map((term, index) => ({
              id: term.id,
              season: term.name?.split(' ')[0] || 'Fall',
              year: parseInt(term.name?.split(' ')[1]) || new Date().getFullYear(),
              courses: term.courses || [],
              isNew: false,
              savedCourseIds: (term.courses || []).map(c => c.id)
            }));
            setTerms(transformedTerms);
            setPlanned([]);

            alert('Schedule saved successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to save schedule. See console for details.');
        }
    }

<<<<<<< HEAD
    async function handlePrereqModalSubmit(notTakenCourses) {
        if (!studentId) {
            alert('Student ID not loaded. Please refresh the page.');
            return;
        }
        try {
            //prerequisite and deficiency course codes
            const PREREQUISITES = [
              { code: 'CS 1120' },
              { code: 'CS 1121' },
            ];
            const DEFICIENCIES = [
              { code: 'CS 1550' },
              { code: 'CS 2100' },
              { code: 'CS 2240' },
              { code: 'CS 3383' },
              { code: 'CS 3195' },
              { code: 'CS 3185' },
            ];
            
            const allProgramCourses = [...PREREQUISITES, ...DEFICIENCIES];
            const notTakenCodes = notTakenCourses.map(c => c.course_code);
            for (let course of courses) {
              const isProgramCourse = allProgramCourses.some(p => p.code === course.course_code);
              const isNotTaken = notTakenCodes.includes(course.course_code);
              
              if (isProgramCourse && !isNotTaken) {
                try {
                  await api.post('/enrollments', {
                    student_id: studentId,
                    course_id: course.id,
                    term: 'Transfer/Prior',
                    status: 'completed',
                  });
                } catch (err) {
                  console.error('Failed to create enrollment for', course.course_code, err);
                }
              }
            }
            
            setShowPrereqModal(false);
            localStorage.setItem(`prereq_modal_completed_${studentId}`, 'true');
            alert('Prerequisites marked as completed!');
        } catch (err) {
            console.error('Failed to mark prerequisites as completed', err);
            alert('Failed to save prerequisites. Please try again.');
        }
    }

    function handleClosePrereqModal() {
        localStorage.setItem(`prereq_modal_completed_${studentId}`, 'true');
        setShowPrereqModal(false);
    }
=======
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
>>>>>>> cad61e4fa28866b9f18842e3dab6329ba5656565

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
