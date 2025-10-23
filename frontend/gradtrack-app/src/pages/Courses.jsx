import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
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
        prerequisites: [],
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
                const groups = c.prerequisiteGroups || [];
                return { ...c, prerequisiteGroups: groups };
            });
            setCourses(normalized);
        } catch (error) {
            console.error("Error fetching courses:", error);
            alert("Failed to fetch courses. Please try again later.");
        }
        finally {
            setLoading(false);
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
            alert("Failed to delete course. Please try again later.");
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
            //may work may not but we ball
            prerequisiteGroups: course.prerequisiteGroups || [],
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
    async function  handleAddPrerequisiteGroup(e) {
        e.preventDefault();
        const { course_id, prerequisiteIds } = groupForm;
        if (!course_id || prerequisiteIds.length === 0) {
            alert("Please select a course and at least one prerequisite.");
            return;
        }

        try {
            await api.post(`/courses/${course_id}/prerequisite-groups`, { prerequisite_ids: prerequisiteIds });
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
        const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
        setGroupForm(prev => ({ ...prev, prerequisiteIds: selected }));
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
        <div>
            <h1>Courses</h1>
        </div>
    );
}