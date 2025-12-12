import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown, Filter } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { getCurrentUser } from "../../lib/database";
import ExerciseDetailModal from "./ExerciseDetailModal";
import ExerciseProgressionCard from "./ExerciseProgressionCard";
import ExerciseProgressionEmptyState from "./ExerciseProgressionEmptyState";
import ExerciseProgressionFilterModal from "./ExerciseProgressionFilterModal";
import { getExerciseList, sortExerciseList } from "./utils/exerciseProgressionUtils";

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function ExerciseProgression({ exerciseProgression }) {
    const colors = useThemedColors();
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortBy, setSortBy] = useState('last1RM');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const user = await getCurrentUser();
        if (user) {
            setUserId(user.id);
        }
    };

    const handleExercisePress = (exerciseName) => {
        setSelectedExercise(exerciseName);
        setShowDetailModal(true);
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_COUNT);
    };

    // Reset visible count when exerciseProgression or sort changes
    useEffect(() => {
        setVisibleCount(INITIAL_DISPLAY_COUNT);
    }, [exerciseProgression, sortBy, sortOrder]);
    
    const handleSortChange = (newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    };

    if (!exerciseProgression) {
        return null;
    }

    const exerciseList = getExerciseList(exerciseProgression);
    const sortedExerciseList = sortExerciseList(exerciseList, sortBy, sortOrder);
    const visibleExercises = sortedExerciseList.slice(0, visibleCount);
    const hasMore = sortedExerciseList.length > visibleCount;
    const remainingCount = sortedExerciseList.length - visibleCount;

    return (
        <View>
            {exerciseList.length > 0 ? (
                <View>
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 12,
                    }}>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            fontWeight: '500',
                        }}>
                            {exerciseList.length} {exerciseList.length === 1 ? 'exercise' : 'exercises'}
                            {hasMore && ` • Showing ${visibleCount}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(true)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                backgroundColor: colors.background.primary,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                            }}
                        >
                            <Filter size={16} color={colors.primary[600]} />
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: colors.primary[600],
                            }}>
                                Filter
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {visibleExercises.map((exercise) => (
                        <ExerciseProgressionCard
                            key={exercise.name}
                            exercise={exercise}
                            onPress={() => handleExercisePress(exercise.name)}
                        />
                    ))}
                    
                    {/* Load More Button */}
                    {hasMore && (
                        <TouchableOpacity
                            onPress={handleLoadMore}
                            activeOpacity={0.7}
                            style={{
                                marginTop: 8,
                                marginBottom: 12,
                                paddingVertical: 14,
                                paddingHorizontal: 20,
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '600',
                                color: colors.primary[600],
                            }}>
                                Load {Math.min(LOAD_MORE_COUNT, remainingCount)} More
                            </Text>
                            <ChevronDown size={18} color={colors.primary[600]} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ExerciseProgressionEmptyState />
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && userId && (
                <ExerciseDetailModal
                    visible={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    exerciseName={selectedExercise}
                    userId={userId}
                />
            )}

            {/* Filter Modal */}
            <ExerciseProgressionFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
            />
        </View>
    );
}
