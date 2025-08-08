#!/usr/bin/env python3
"""
Enhanced Meal Planning ML Service
Provides intelligent meal recommendations using machine learning algorithms
"""

import json
import sys
import numpy as np
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import random
from collections import defaultdict, Counter
import math

class MealPlanningML:
    def __init__(self):
        self.user_preferences = {}
        self.meal_history = []
        self.nutritional_weights = {
            'protein': 0.25,
            'carbs': 0.25,
            'fiber': 0.15,
            'healthy_fats': 0.15,
            'vitamins': 0.10,
            'minerals': 0.10
        }
        
    def analyze_user_preferences(self, meal_history: List[Dict]) -> Dict[str, float]:
        """
        Analyze user meal history to learn preferences using collaborative filtering
        """
        if not meal_history:
            return self._default_preferences()
            
        cuisine_scores = Counter()
        ingredient_scores = Counter()
        prep_time_preferences = []
        difficulty_preferences = []
        
        for meal in meal_history:
            # Analyze cuisine preferences
            cuisine = meal.get('cuisine', 'unknown')
            rating = meal.get('rating', 3)  # Default neutral rating
            cuisine_scores[cuisine] += rating
            
            # Analyze ingredient preferences
            ingredients = meal.get('ingredients', [])
            for ingredient in ingredients:
                ingredient_scores[ingredient.lower()] += rating
                
            # Analyze timing preferences
            prep_time = meal.get('prepTime', 30)
            prep_time_preferences.append(prep_time)
            
            # Analyze difficulty preferences
            difficulty = meal.get('difficulty', 'medium')
            difficulty_mapping = {'easy': 1, 'medium': 2, 'hard': 3}
            difficulty_preferences.append(difficulty_mapping.get(difficulty, 2))
        
        # Calculate preference scores
        total_meals = len(meal_history)
        preferences = {
            'preferred_cuisines': dict(cuisine_scores),
            'preferred_ingredients': dict(ingredient_scores),
            'avg_prep_time': np.mean(prep_time_preferences) if prep_time_preferences else 30,
            'preferred_difficulty': np.mean(difficulty_preferences) if difficulty_preferences else 2,
            'variety_score': len(set(meal.get('name', '') for meal in meal_history)) / total_meals if total_meals > 0 else 1
        }
        
        return preferences
    
    def _default_preferences(self) -> Dict[str, Any]:
        """Return default preferences for new users"""
        return {
            'preferred_cuisines': {'italian': 3, 'mexican': 3, 'american': 3},
            'preferred_ingredients': {},
            'avg_prep_time': 30,
            'preferred_difficulty': 2,
            'variety_score': 0.8
        }
    
    def calculate_meal_score(self, meal: Dict, user_prefs: Dict, recent_meals: List[str]) -> float:
        """
        Calculate a score for how well a meal matches user preferences
        Uses weighted scoring algorithm
        """
        score = 0.0
        
        # Cuisine preference scoring (weight: 0.3)
        cuisine = meal.get('cuisine', 'unknown')
        cuisine_scores = user_prefs.get('preferred_cuisines', {})
        cuisine_score = cuisine_scores.get(cuisine, 2.5) / 5.0  # Normalize to 0-1
        score += cuisine_score * 0.3
        
        # Ingredient preference scoring (weight: 0.25)
        ingredients = meal.get('ingredients', [])
        ingredient_scores = user_prefs.get('preferred_ingredients', {})
        ingredient_score = 0
        if ingredients:
            ingredient_ratings = [ingredient_scores.get(ing.lower(), 2.5) for ing in ingredients]
            ingredient_score = np.mean(ingredient_ratings) / 5.0
        score += ingredient_score * 0.25
        
        # Prep time preference scoring (weight: 0.15)
        prep_time = meal.get('prepTime', 30)
        preferred_time = user_prefs.get('avg_prep_time', 30)
        time_diff = abs(prep_time - preferred_time) / preferred_time
        time_score = max(0, 1 - time_diff)
        score += time_score * 0.15
        
        # Difficulty preference scoring (weight: 0.15)
        difficulty_mapping = {'easy': 1, 'medium': 2, 'hard': 3}
        meal_difficulty = difficulty_mapping.get(meal.get('difficulty', 'medium'), 2)
        preferred_difficulty = user_prefs.get('preferred_difficulty', 2)
        difficulty_diff = abs(meal_difficulty - preferred_difficulty) / 2
        difficulty_score = max(0, 1 - difficulty_diff)
        score += difficulty_score * 0.15
        
        # Variety bonus (weight: 0.15) - penalize recent meals
        meal_name = meal.get('name', '')
        if meal_name in recent_meals:
            variety_penalty = 0.5 * (1 - recent_meals.index(meal_name) / len(recent_meals))
            score -= variety_penalty * 0.15
        else:
            score += 0.15  # Bonus for new meals
        
        return min(1.0, max(0.0, score))
    
    def balance_nutrition_weekly(self, meals: List[Dict]) -> List[Dict]:
        """
        Optimize weekly meal plan for nutritional balance
        """
        if len(meals) < 7:
            return meals
            
        # Calculate current nutritional profile
        nutrition_totals = defaultdict(float)
        for meal in meals:
            nutrition = meal.get('nutrition', {})
            for nutrient, value in nutrition.items():
                nutrition_totals[nutrient] += value
        
        # Define weekly nutritional targets (example values)
        weekly_targets = {
            'protein': 350,  # grams
            'carbs': 1400,   # grams
            'fiber': 175,    # grams
            'healthy_fats': 280,  # grams
            'vitamins': 100,      # arbitrary units
            'minerals': 100       # arbitrary units
        }
        
        # Calculate nutritional gaps
        nutrition_gaps = {}
        for nutrient, target in weekly_targets.items():
            current = nutrition_totals.get(nutrient, 0)
            nutrition_gaps[nutrient] = max(0, target - current)
        
        # Sort meals by nutritional value to fill gaps
        def nutrition_priority_score(meal):
            nutrition = meal.get('nutrition', {})
            score = 0
            for nutrient, gap in nutrition_gaps.items():
                if gap > 0:
                    nutrient_value = nutrition.get(nutrient, 0)
                    score += nutrient_value * (gap / weekly_targets.get(nutrient, 1))
            return score
        
        # Re-sort meals to optimize nutrition
        meals_with_scores = [(meal, nutrition_priority_score(meal)) for meal in meals]
        meals_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [meal for meal, _ in meals_with_scores]
    
    def generate_smart_meal_plan(self, available_meals: List[Dict], 
                                meal_history: List[Dict], 
                                days: int = 7,
                                dietary_restrictions: List[str] = None) -> List[Dict]:
        """
        Generate an intelligent weekly meal plan using ML algorithms
        """
        dietary_restrictions = dietary_restrictions or []
        
        # Learn user preferences from history
        user_prefs = self.analyze_user_preferences(meal_history)
        
        # Filter meals based on dietary restrictions
        filtered_meals = []
        for meal in available_meals:
            if self._meets_dietary_restrictions(meal, dietary_restrictions):
                filtered_meals.append(meal)
        
        if not filtered_meals:
            return []
        
        # Get recent meal names to avoid repetition
        recent_meals = [meal.get('name', '') for meal in meal_history[-14:]]  # Last 2 weeks
        
        # Score all available meals
        meal_scores = []
        for meal in filtered_meals:
            score = self.calculate_meal_score(meal, user_prefs, recent_meals)
            meal_scores.append((meal, score))
        
        # Sort by score and select top candidates
        meal_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Select meals using weighted random selection to ensure variety
        selected_meals = []
        used_meals = set()
        
        for day in range(days):
            # Create a weighted selection pool
            available_candidates = [
                (meal, score) for meal, score in meal_scores 
                if meal.get('name', '') not in used_meals
            ]
            
            if not available_candidates:
                # If we run out of unique meals, reset and allow repeats
                available_candidates = meal_scores
                used_meals.clear()
            
            # Weighted random selection
            if available_candidates:
                weights = [score + 0.1 for _, score in available_candidates]  # Add small base weight
                selected_meal = self._weighted_random_choice(available_candidates, weights)
                selected_meals.append(selected_meal[0])
                used_meals.add(selected_meal[0].get('name', ''))
        
        # Optimize for nutritional balance
        balanced_meals = self.balance_nutrition_weekly(selected_meals)
        
        return balanced_meals
    
    def _weighted_random_choice(self, items: List[Tuple], weights: List[float]) -> Tuple:
        """Select item using weighted random selection"""
        total_weight = sum(weights)
        random_value = random.uniform(0, total_weight)
        
        cumulative_weight = 0
        for i, weight in enumerate(weights):
            cumulative_weight += weight
            if random_value <= cumulative_weight:
                return items[i]
        
        return items[-1] if items else None
    
    def _meets_dietary_restrictions(self, meal: Dict, restrictions: List[str]) -> bool:
        """Check if meal meets dietary restrictions"""
        meal_tags = [tag.lower() for tag in meal.get('tags', [])]
        meal_ingredients = [ing.lower() for ing in meal.get('ingredients', [])]
        
        restriction_checks = {
            'vegetarian': lambda: 'vegetarian' in meal_tags or not any(
                meat in ' '.join(meal_ingredients) 
                for meat in ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb']
            ),
            'vegan': lambda: 'vegan' in meal_tags or (
                'vegetarian' in meal_tags and not any(
                    dairy in ' '.join(meal_ingredients)
                    for dairy in ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg']
                )
            ),
            'gluten-free': lambda: 'gluten-free' in meal_tags or not any(
                gluten in ' '.join(meal_ingredients)
                for gluten in ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye']
            ),
            'dairy-free': lambda: 'dairy-free' in meal_tags or not any(
                dairy in ' '.join(meal_ingredients)
                for dairy in ['milk', 'cheese', 'butter', 'cream', 'yogurt']
            ),
            'low-carb': lambda: meal.get('nutrition', {}).get('carbs', 50) < 30,
            'keto': lambda: (
                meal.get('nutrition', {}).get('carbs', 50) < 20 and
                meal.get('nutrition', {}).get('healthy_fats', 0) > 15
            )
        }
        
        for restriction in restrictions:
            restriction_lower = restriction.lower()
            if restriction_lower in restriction_checks:
                if not restriction_checks[restriction_lower]():
                    return False
        
        return True
    
    def analyze_nutrition_gaps(self, meal_plan: List[Dict]) -> Dict[str, Any]:
        """Analyze nutritional gaps in the meal plan"""
        total_nutrition = defaultdict(float)
        
        for meal in meal_plan:
            nutrition = meal.get('nutrition', {})
            for nutrient, value in nutrition.items():
                total_nutrition[nutrient] += value
        
        # Weekly recommended values
        weekly_recommendations = {
            'protein': 350,
            'carbs': 1400,
            'fiber': 175,
            'healthy_fats': 280,
            'vitamins': 100,
            'minerals': 100
        }
        
        analysis = {
            'current_totals': dict(total_nutrition),
            'recommendations': weekly_recommendations,
            'gaps': {},
            'excesses': {},
            'balance_score': 0
        }
        
        balance_scores = []
        for nutrient, recommended in weekly_recommendations.items():
            current = total_nutrition.get(nutrient, 0)
            if current < recommended * 0.8:  # Less than 80% of recommended
                analysis['gaps'][nutrient] = recommended - current
            elif current > recommended * 1.2:  # More than 120% of recommended
                analysis['excesses'][nutrient] = current - recommended
            
            # Calculate balance score (0-1, where 1 is perfect)
            ratio = current / recommended if recommended > 0 else 0
            balance_score = 1 - abs(1 - ratio) if ratio <= 2 else 0
            balance_scores.append(balance_score)
        
        analysis['balance_score'] = np.mean(balance_scores) if balance_scores else 0
        
        return analysis

def main():
    parser = argparse.ArgumentParser(description='Enhanced Meal Planning ML Service')
    parser.add_argument('--action', required=True, choices=['generate_plan', 'analyze_preferences', 'nutrition_analysis'])
    parser.add_argument('--meals', help='JSON string of available meals')
    parser.add_argument('--history', help='JSON string of meal history')
    parser.add_argument('--restrictions', help='JSON string of dietary restrictions')
    parser.add_argument('--days', type=int, default=7, help='Number of days to plan')
    
    args = parser.parse_args()
    
    ml_service = MealPlanningML()
    
    try:
        if args.action == 'generate_plan':
            available_meals = json.loads(args.meals) if args.meals else []
            meal_history = json.loads(args.history) if args.history else []
            dietary_restrictions = json.loads(args.restrictions) if args.restrictions else []
            
            meal_plan = ml_service.generate_smart_meal_plan(
                available_meals, meal_history, args.days, dietary_restrictions
            )
            
            result = {
                'success': True,
                'meal_plan': meal_plan,
                'plan_info': {
                    'total_meals': len(meal_plan),
                    'days_planned': args.days,
                    'dietary_restrictions': dietary_restrictions
                }
            }
            
        elif args.action == 'analyze_preferences':
            meal_history = json.loads(args.history) if args.history else []
            preferences = ml_service.analyze_user_preferences(meal_history)
            
            result = {
                'success': True,
                'preferences': preferences
            }
            
        elif args.action == 'nutrition_analysis':
            meal_plan = json.loads(args.meals) if args.meals else []
            analysis = ml_service.analyze_nutrition_gaps(meal_plan)
            
            result = {
                'success': True,
                'nutrition_analysis': analysis
            }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'type': type(e).__name__
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()
