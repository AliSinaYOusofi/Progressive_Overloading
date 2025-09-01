import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    RefreshControl 
} from "react-native";
import { 
    Dumbbell, 
    Plus, 
    Calendar, 
    Target, 
    Play, 
    Edit, 
    Trash2, 
    Clock,
    Users,
    TrendingUp,
    Icon
} from "lucide-react-native";
import { colors } from "../constants/ui_colors";
import { 
    getCurrentUser,
    getWorkoutCategories,
    getWorkoutTemplates,
    getRecentWorkoutSessions,
    createWorkoutCategory,
    deleteWorkoutCategory,
    createWorkoutTemplate,
    deleteWorkoutTemplate
} from "../lib/database";
import AddCategoryModal, { CATEGORY_ICONS } from "../components/HomeScreen/AddCategoryModal";
import AddWorkoutModal from "../components/HomeScreen/AddWorkoutModal";

export default function WorkoutsScreen() {
    // State management
    const [user, setUser] = useState(null);
    const [workoutCategories, setWorkoutCategories] = useState([]);
    const [workoutTemplates, setWorkoutTemplates] = useState([]);
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Modal states
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);

    useEffect(() => {
        loadWorkoutData();
    }, []);

    const loadWorkoutData = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                setIsLoading(true);
            }

            // Get current user
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                console.log("No user found");
                return;
            }
            setUser(currentUser);

            // Load workout data in parallel
            const [categories, templates, sessions] = await Promise.all([
                getWorkoutCategories(currentUser.id),
                getWorkoutTemplates(currentUser.id),
                getRecentWorkoutSessions(currentUser.id, 5)
            ]);

            setWorkoutCategories(categories);
            setWorkoutTemplates(templates);
            setRecentWorkouts(sessions);

        } catch (error) {
            console.error("Error loading workout data:", error);
            Alert.alert("Error", "Failed to load workout data");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []); // Empty dependency array since this function doesn't depend on any props or state

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadWorkoutData(true);
    }, [loadWorkoutData]);

    const handleDeleteCategory = useCallback(async (categoryId) => {
        Alert.alert(
            "Delete Category",
            "Are you sure you want to delete this category? This will also delete all associated workout templates.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWorkoutCategory(categoryId);
                            await loadWorkoutData(true);
                            Alert.alert("Success", "Category deleted successfully");
                        } catch (error) {
                            console.error("Error deleting category:", error);
                            Alert.alert("Error", "Failed to delete category");
                        }
                    }
                }
            ]
        );
    }, [loadWorkoutData]);

    const handleDeleteTemplate = useCallback(async (templateId) => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout template?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWorkoutTemplate(templateId);
                            await loadWorkoutData(true);
                            Alert.alert("Success", "Workout template deleted successfully");
                        } catch (error) {
                            console.error("Error deleting template:", error);
                            Alert.alert("Error", "Failed to delete workout template");
                        }
                    }
                }
            ]
        );
    }, [loadWorkoutData]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }, []);

    const getCategoryStats = useCallback((categoryId) => {
        const templates = workoutTemplates.filter(t => t.category_id === categoryId);
        const totalExercises = templates.reduce((sum, template) => 
            sum + (template.workout_template_exercises?.length || 0), 0
        );
        
        // Find most recent workout for this category
        const recentWorkout = recentWorkouts.find(workout => 
            workout.workout_templates?.workout_categories?.id === categoryId
        );
        
        return {
            exerciseCount: totalExercises,
            templateCount: templates.length,
            lastDone: recentWorkout ? formatDate(recentWorkout.started_at) : "Never"
        };
    }, [workoutTemplates, recentWorkouts, formatDate]);

    const handleCategoryAdded = useCallback(async () => {
        setShowAddCategoryModal(false);
        await loadWorkoutData(true);
    }, [loadWorkoutData]);

    const handleWorkoutAdded = useCallback(async () => {
        setShowAddWorkoutModal(false);
        await loadWorkoutData(true);
    }, [loadWorkoutData]);

    // Memoize categories to prevent unnecessary re-renders
    const memoizedCategories = useMemo(() => workoutCategories, [workoutCategories]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={styles.loadingText}>Loading workouts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
                        <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary[600]]}
                        tintColor={colors.primary[600]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Workouts</Text>
                    <Text style={styles.subtitle}>Manage your workout routines</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddWorkoutModal(true)}
                    >
                        <Plus size={20} color={colors.background.primary} />
                        <Text style={styles.addButtonText}>New Workout</Text>
                    </TouchableOpacity>
                </View>

                {/* Workout Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Workout Categories</Text>
                        <TouchableOpacity 
                            style={styles.addCategoryButton}
                            onPress={() => setShowAddCategoryModal(true)}
                        >
                            <Plus size={16} color={colors.primary[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    {workoutCategories.length > 0 ? (
                        workoutCategories.map((category) => {
                            const stats = getCategoryStats(category.id);
                            const Icon = CATEGORY_ICONS[category.icon];
                            return (
                                <View key={category.id} style={styles.categoryCard}>
                                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                                        <Icon icon={Icon} size={24} color={category.color || colors.primary[600]} />
                            </View>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryDetails}>
                                            {stats.templateCount} templates • {stats.exerciseCount} exercises
                                        </Text>
                                        <Text style={styles.categoryLastDone}>
                                            Last done: {stats.lastDone}
                                </Text>
                            </View>
                                    <View style={styles.categoryActions}>
                                        <TouchableOpacity 
                                            style={styles.actionButton}
                                            onPress={() => handleDeleteCategory(category.id)}
                                        >
                                            <Trash2 size={16} color={colors.status.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <Dumbbell size={48} color={colors.text.tertiary} />
                            <Text style={styles.emptyStateTitle}>No Categories Yet</Text>
                            <Text style={styles.emptyStateText}>
                                Create your first workout category to get started
                            </Text>
                            <TouchableOpacity 
                                style={styles.emptyStateButton}
                                onPress={() => setShowAddCategoryModal(true)}
                            >
                                <Text style={styles.emptyStateButtonText}>Create Category</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Workout Templates */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Workout Templates</Text>
                    
                    {workoutTemplates.length > 0 ? (
                        workoutTemplates.map((template) => (
                            <View key={template.id} style={styles.templateCard}>
                                <View style={styles.templateIcon}>
                                    <Target size={20} color={colors.primary[600]} />
                                </View>
                                <View style={styles.templateInfo}>
                                    <Text style={styles.templateName}>{template.name}</Text>
                                    <Text style={styles.templateDetails}>
                                        {template.workout_template_exercises?.length || 0} exercises
                                        {template.estimated_duration && ` • ${template.estimated_duration} min`}
                                    </Text>
                                    {template.workout_categories && (
                                        <Text style={styles.templateCategory}>
                                            {template.workout_categories.name}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.templateActions}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Play size={16} color={colors.status.success} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={() => handleDeleteTemplate(template.id)}
                                    >
                                        <Trash2 size={16} color={colors.status.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Target size={48} color={colors.text.tertiary} />
                            <Text style={styles.emptyStateTitle}>No Workouts Yet</Text>
                            <Text style={styles.emptyStateText}>
                                Create your first workout template to start training
                            </Text>
                            <TouchableOpacity 
                                style={styles.emptyStateButton}
                                onPress={() => setShowAddWorkoutModal(true)}
                            >
                                <Text style={styles.emptyStateButtonText}>Create Workout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Recent Workouts */}
                {recentWorkouts.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Workouts</Text>
                        {recentWorkouts.map((workout) => (
                            <View key={workout.id} style={styles.recentWorkout}>
                        <View style={styles.workoutIcon}>
                                    <TrendingUp size={20} color={colors.status.success} />
                        </View>
                        <View style={styles.workoutInfo}>
                                    <Text style={styles.workoutName}>
                                        {workout.workout_templates?.name || "Unknown Workout"}
                                    </Text>
                                    <Text style={styles.workoutTime}>
                                        {formatDate(workout.started_at)}
                                        {workout.completed_at && (
                                            ` • ${Math.round((new Date(workout.completed_at) - new Date(workout.started_at)) / 60000)} min`
                                        )}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Play size={16} color={colors.primary[600]} />
                                </TouchableOpacity>
                        </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Modals */}
            <AddCategoryModal
                visible={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                onCategoryAdded={handleCategoryAdded}
            />
            
            <AddWorkoutModal
                visible={showAddWorkoutModal}
                onClose={() => setShowAddWorkoutModal(false)}
                onWorkoutAdded={handleWorkoutAdded}
                categories={memoizedCategories}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 120,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.primary,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.text.secondary,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: "center",
    },
    quickActions: {
        marginBottom: 30,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary[600],
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: colors.background.primary,
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.text.primary,
    },
    addCategoryButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
    },
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    categoryDetails: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    categoryLastDone: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    categoryActions: {
        flexDirection: "row",
        gap: 8,
    },
    templateCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    templateIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    templateInfo: {
        flex: 1,
    },
    templateName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    templateDetails: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    templateCategory: {
        fontSize: 12,
        color: colors.primary[600],
        fontWeight: "500",
    },
    templateActions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    recentWorkout: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    workoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.status.successLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    workoutTime: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: colors.background.card,
        borderRadius: 12,
        marginBottom: 12,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    emptyStateButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: colors.background.primary,
        fontSize: 14,
        fontWeight: "600",
    },
});
