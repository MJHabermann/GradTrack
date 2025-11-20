import React, { useEffect, useState } from "react";
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import axios from "axios";
import './Courses.css'
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [filterLevel, setFilterLevel] = useState("");
    // state for adding a new course
    const [newCourse, setNewCourse] = useState({
        course_code: "",
        title: "",
        credits: 0,
        level: "undergraduate",
    });
    // state for editing an existing course
    const [editingID, setEditingID] = useState(null);
    const [editingCourse, setEditingCourse] = useState({});
    // state for managing prerequisite groups
    const [groupForm, setGroupForm] = useState({
        course_id: "",
        prerequisiteIds: [],
    });
    useEffect(() => {
        fetchCourses();
    }, [filterLevel]);
    // grab the courses from the database to display
    async function fetchCourses() {
        try {
            setLoading(true);
            const params = {};
            if (filterLevel) params.level = filterLevel;
            const response = await api.get("/courses", { params });
            const normalized = response.data.map((c) => {
                //may not work
                const groups = c.prerequisiteGroups ?? c.prerequisite_groups ?? [];
                return { ...c, prerequisiteGroups: groups };
            });
            setCourses(normalized);
        } catch (error) {
            console.error("Error fetching courses:", error);
            alert("Failed to fetch courses. Please try again later.", error);
        }
        finally {
            setLoading(false);
        }
    }
    //function to import courses from a json file
    async function importCoursesFromJson(jsonFile) {
        try {
            for (const course of jsonFile) {
                await api.post("/courses", course);
            }
            await fetchCourses();
        } catch (error) {
            console.error("Error importing courses:", error);
            alert("Failed to import courses. Please try again later.");
        }
    }
    //function to export courses to a json file
    async function exportCoursesToJson() {
        try {
            const response = await api.get("/courses");
            const data = response.data;
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "courses.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting courses:", error);
            alert("Failed to export courses. Please try again later.");
        }
    }
    // adds a new course to the database
    async function handleAddCourse(e) {
        e.preventDefault();
        try {
            await api.post("/courses", newCourse);
            setNewCourse({
                course_code: "",
                title: "",
                credits: 0,
                level: "undergraduate",
            });
            await fetchCourses();
        } catch (error) {
            console.error("Error adding course:", error);
            alert("Failed to add course. Please try again later.");
        }
    }
    // deletes a course from the database
    async function handleDeleteCourse(course) {
        if (!window.confirm(`Are you sure you want to delete ${course.course_code}?`)) return;
        try {
            await api.delete(`/courses/${course.id}`);
            await fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            const errorMsg = error.response?.data?.message || error.message || "Unknown error";
            alert(`Failed to delete course: ${errorMsg}`);
        }
    }
    // starts editing a course
    function startEditing(course) {
        setEditingID(course.id);
        setEditingCourse({
            course_code: course.course_code,
            title: course.title,
            credits: course.credits,
            level: course.level,

        });
    }
    // cancels editing a course
    function cancelEditing() {
        setEditingID(null);
        setEditingCourse({});
    }
    // saves the edited course to the database
    async function saveEditing(courseId) {
        try {
            await api.put(`/courses/${courseId}`, editingCourse);
            setEditingID(null);
            setEditingCourse({});
            await fetchCourses();
        } catch (error) {
            console.error("Error updating course:", error);
            alert("Failed to update course. Please try again later.");
        }
    }
    // function to handle adding a prerequisite group
    async function handleAddPrerequisiteGroup(e) {
        e.preventDefault();
        const { course_id, prerequisiteIds } = groupForm;
        if (!course_id || prerequisiteIds.length === 0) {
            alert("Please select a course and at least one prerequisite.");
            return;
        }

        try {
            await api.post(`/courses/${course_id}/prerequisite-groups`,
            { prerequisite_ids: prerequisiteIds });
            setGroupForm({ course_id: "", prerequisiteIds: [] });
            await fetchCourses();
        } catch (error) {
            console.error("Error adding prerequisite group:", error);
            alert("Failed to add prerequisite group. Please try again later.");
        }
    }

    // remove prerequisite group
    async function handleRemovePrerequisiteGroup(courseId, groupId) {
        if (!window.confirm(`Are you sure you want to remove this prerequisite group?`)) return;
        try {
            await api.delete(`/courses/${courseId}/prerequisite-groups/${groupId}`);
            await fetchCourses();
        } catch (error) {
            console.error("Error removing prerequisite group:", error);
            alert("Failed to remove prerequisite group. Please try again later.");
        }
    }

    // function to handle multi-select for prerequisites
    function onGroupSelectChange(e) {
        const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
        setGroupForm((s) => ({ ...s, prerequisiteIds: selected }));
    }
    // display prerequisite groups in human-readable format
    function prereqGroupsDisplay(prereqGroups = []) {
        if (!prereqGroups || prereqGroups.length === 0) return "None";
        const parts = prereqGroups.map(group => {
            const courseCodes = group.prerequisites.map(prereq => prereq.course_code);
            return `(${courseCodes.join(" OR ")})`;
        });
        return parts.join(" AND ");
    }

    return (
        <>
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <Navbar />
            <main style={{ paddingLeft: sidebarOpen ? '230px' : '0' }}>
                {/* Filter by course level */}
                <div className="filter-level">
                    <label className="font-medium">Filter by Level:</label>
                    <select
                        className="filter-level-select"
                        value={filterLevel}
                        onChange={e => setFilterLevel(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="graduate">Graduate</option>
                    </select>
                    {/*<button className="reset-sort-button" onClick={() => {
                        setFilterLevel("");
                        fetchCourses();
                    }}>
                        Reset Filter
                    </button>*/}
                </div>
                {/* List all courses table */}
                <div className="courses-table">
                    {/* TODO: add amount per page and more than 1 page */}
                    <table className="displayed-courses">
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Name</th>
                                <th>Credits</th>
                                <th>Level</th>
                                <th>Prerequisites</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="6">Loading...</td></tr>) : (
                                courses.map(course => (
                                    editingID === course.id ? (
                                        <tr key={course.id} className="editing-row">
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editingCourse.course_code || ""}
                                                    onChange={e => setEditingCourse(s => ({ ...s, course_code: e.target.value }))}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editingCourse.title || ""}
                                                    onChange={e => setEditingCourse(s => ({ ...s, title: e.target.value }))}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={editingCourse.credits ?? 0}
                                                    onChange={e => setEditingCourse(s => ({ ...s, credits: Number(e.target.value) }))}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={editingCourse.level || ""}
                                                    onChange={e => setEditingCourse(s => ({ ...s, level: e.target.value }))}
                                                >
                                                    <option value="">Select Level</option>
                                                    <option value="undergraduate">Undergraduate</option>
                                                    <option value="graduate">Graduate</option>
                                                </select>
                                            </td>
                                            <td>{prereqGroupsDisplay(course.prerequisiteGroups || course.prerequisite_groups)}</td>
                                            <td>
                                                <button type="button" onClick={() => saveEditing(course.id)} className="save-button">Save</button>
                                                <button type="button" onClick={cancelEditing} className="cancel-button">Cancel</button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={course.id}>
                                            <td>{course.course_code}</td>
                                            <td>{course.title}</td>
                                            <td>{course.credits}</td>
                                            <td>{course.level}</td>
                                            <td>{prereqGroupsDisplay(course.prerequisiteGroups || course.prerequisite_groups)}</td>
                                            <td>
                                                <button onClick={() => startEditing(course)} className="edit-button">Edit</button>
                                                <button onClick={() => handleDeleteCourse(course)} className="delete-button">Delete</button>
                                            </td>
                                        </tr>
                                    )
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Add course form */}
                <div className="add-course-form">
                    <h2>Add New Course</h2>
                    <form onSubmit={handleAddCourse}>
                        <div>
                            <label>Course Code:</label>
                            <input
                                type="text"
                                value={newCourse.course_code}
                                onChange={e => setNewCourse({ ...newCourse, course_code: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Title:</label>
                            <input
                                type="text"
                                value={newCourse.title}
                                onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Credits:</label>
                            <input
                                type="number"
                                value={newCourse.credits}
                                onChange={e => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label>Level:</label>
                            <select
                                value={newCourse.level}
                                onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="undergraduate">Undergraduate</option>
                                <option value="graduate">Graduate</option>
                            </select>
                        </div>
                        <div>
                            <label>Prerequisites:</label>
                            <select
                                multiple
                                value={newCourse.prerequisiteIds}
                                onChange={onGroupSelectChange}
                            >
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.course_code} - {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit">Add Course</button>
                    </form>
                </div>
                {/* Add pre-requisites form */}
                <div className="add-prerequisites-form">
                    <h2>Add Prerequisite Group</h2>
                    <form onSubmit={handleAddPrerequisiteGroup}>
                        <label className="group-name-label">Select the course that this group applies to:</label>
                        <select
                            className="course_id"
                            value={groupForm.course_id}
                            onChange={e => setGroupForm({ ...groupForm, course_id: e.target.value })}
                            required
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.course_code} - {course.title}
                                </option>
                            ))}
                        </select>
                        
                        <label className="group-name-label">Select Pre-Requisites for this OR-group (use Cntrl/cmd to multi-select):</label>
                        <select
                            multiple
                            size={6}
                            value={groupForm.prerequisiteIds.map(String)}
                            onChange={onGroupSelectChange}
                            required
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.course_code} - {course.title}
                                </option>
                            ))}
                        </select>
                        <button type="submit">Add Prerequisite Group</button>
                    </form>
                    <p>Note: adding multiple prerequisites to a group acts as an AND operation.</p>
                </div>
                {/* Import/Export buttons */}
                <div className="import-export-buttons">
                    <input
                        type="file"
                        accept=".json"
                        onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    const json = JSON.parse(event.target.result);
                                    await importCoursesFromJson(json);
                                };
                                reader.readAsText(file);
                            }
                        }}
                    />
                    <button onClick={exportCoursesToJson}>Export Courses to JSON</button>
                </div>
            </main>
        </>
    );
}