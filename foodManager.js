// Food management functions
import { updateFoodsInDB } from './dataManager.js';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc } from 'https://unpkg.com/firebase@9.23.0/dist/index.esm.js';

// Use the globally initialized Firebase instance
const db = window.firebase.firestore();

// Food editing state
let editingFood = null;

export function editFood(idx, renderFoodsListCallback) {
  editingFood = idx;
  renderFoodsListCallback();
}

export function saveFoodEdit(idx, currentUser, foodsArr, renderFoodsListCallback) {
  const input = document.getElementById('editFoodInput' + idx);
  const newName = input.value.trim();
  if (newName) {
    foodsArr[idx] = newName;
    updateFoodsInDB(currentUser, foodsArr);
    editingFood = null;
    renderFoodsListCallback();
  }
  return foodsArr;
}

export function cancelFoodEdit(renderFoodsListCallback) {
  editingFood = null;
  renderFoodsListCallback();
}

export function deleteFood(idx, currentUser, foodsArr, renderFoodsListCallback) {
  foodsArr.splice(idx, 1);
  updateFoodsInDB(currentUser, foodsArr);
  renderFoodsListCallback();
  return foodsArr;
}

export function addFood(newFoodName, currentUser, foodsArr, renderFoodsListCallback) {
  if (newFoodName && !foodsArr.includes(newFoodName)) {
    foodsArr.push(newFoodName);
    updateFoodsInDB(currentUser, foodsArr);
    renderFoodsListCallback();
    document.getElementById('newFood').value = '';
  }
  return foodsArr;
}

export function renderFoodsList(foodsArr) {
  const foodsList = document.getElementById('foodsList');
  foodsList.innerHTML = '';
  foodsArr.forEach((food, idx) => {
    const li = document.createElement('li');
    if (editingFood === idx) {
      li.innerHTML = `<input type='text' id='editFoodInput${idx}' value='${food}' style='width:120px; margin-right:8px;'>`
        + `<button onclick='saveFoodEdit(${idx})' style='background:#4f8cff;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;margin-right:4px;'>Save</button>`
        + `<button onclick='cancelFoodEdit()' style='background:#e0e7ff;color:#333;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;'>Cancel</button>`;
    } else {
      li.innerHTML = `${food} <button onclick="editFood(${idx})" style='background:#4f8cff;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;margin-left:4px;'>Edit</button> <button onclick="deleteFood(${idx})" style='background:#e74c3c;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;margin-left:4px;'>Delete</button>`;
    }
    foodsList.appendChild(li);
  });
}