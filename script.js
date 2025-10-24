// Smooth fade-in
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  
  // Initialize authentication forms
  initAuthForms();
  
  const form = document.querySelector(".login-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const email = data.get("email");
      const password = data.get("password");

      // Validate inputs
      if (!email || !email.includes('@')) {
        showAuthError('Please enter a valid email address');
        return;
      }

      if (!password || password.length < 1) {
        showAuthError('Please enter your password');
        return;
      }

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Authenticating...';
      submitBtn.disabled = true;

      try {
        // Authenticate user
        const authResult = await window.COOKIFY_AUTH.authenticateUser(email, password);
        
        if (authResult.success) {
          // Success - proceed to next page (session is managed by Flask)
          document.body.classList.remove("fade-in");
          const target = form.getAttribute("action") || "Cookify - Ingredients.html";
          setTimeout(() => { window.location.href = target; }, 500);
        } else {
          // Authentication failed
          showAuthError(authResult.message);
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Authentication error:', error);
        showAuthError('Authentication failed. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  const hasRecipesPage = document.getElementById('perfectResults') || document.getElementById('partialResults');
  if (hasRecipesPage) {
    initRecipesPage();
  }

  const detailTitle = document.getElementById("recipeTitle");
  if (detailTitle) {
    initRecipeDetailsPage();
  }
});

// Authentication utility functions
function showAuthError(message) {
  // Remove any existing error messages
  const existingError = document.querySelector('.auth-error');
  if (existingError) {
    existingError.remove();
  }

  // Create and show error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'auth-error';
  errorDiv.style.cssText = `
    background: #fee;
    color: #c33;
    padding: 12px;
    border-radius: 8px;
    margin: 10px 0;
    border: 1px solid #fcc;
    font-size: 14px;
    text-align: center;
    animation: shake 0.5s ease-in-out;
  `;
  errorDiv.textContent = message;

  // Find the currently visible form (login or register)
  const loginForm = document.querySelector('.login-form');
  const registerForm = document.querySelector('.register-form');
  let targetForm = null;
  
  if (loginForm && loginForm.style.display !== 'none') {
    targetForm = loginForm;
  } else if (registerForm && registerForm.style.display !== 'none') {
    targetForm = registerForm;
  } else if (loginForm) {
    targetForm = loginForm; // fallback to login form
  }
  
  if (targetForm) {
    targetForm.insertBefore(errorDiv, targetForm.firstChild);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

async function checkAuthStatus() {
  try {
    const authData = await window.COOKIFY_AUTH.checkAuthStatus();
    return {
      isAuthenticated: authData.authenticated,
      user: authData.user || null
    };
  } catch (e) {
    console.error('Auth status check failed:', e);
    return { isAuthenticated: false, user: null };
  }
}

async function logout() {
  try {
    const result = await window.COOKIFY_AUTH.logout();
    if (result.success) {
      window.location.href = 'Cookify - Welcome.html';
    } else {
      console.error('Logout failed:', result.message);
      // Force redirect anyway
      window.location.href = 'Cookify - Welcome.html';
    }
  } catch (e) {
    console.warn('Could not logout properly:', e);
    // Force redirect anyway
    window.location.href = 'Cookify - Welcome.html';
  }
}

function clearAuthErrors() {
  const existingErrors = document.querySelectorAll('.auth-error');
  existingErrors.forEach(error => error.remove());
}

function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterLink = document.getElementById('showRegister');
  const showLoginLink = document.getElementById('showLogin');

  // Form switching functionality
  if (showRegisterLink && registerForm && loginForm) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuthErrors();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });
  }

  if (showLoginLink && registerForm && loginForm) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuthErrors();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Registration form handler
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(registerForm);
      const name = data.get('name');
      const email = data.get('email');
      const password = data.get('password');
      const confirmPassword = data.get('confirmPassword');

      // Validate inputs
      if (!name || name.trim().length < 2) {
        showAuthError('Please enter a valid name (at least 2 characters)');
        return;
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        showAuthError('Please enter a valid email address');
        return;
      }

      if (!password || password.length < 6) {
        showAuthError('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
      }

      // Show loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating Account...';
      submitBtn.disabled = true;

      try {
        // Register user
        const registerResult = await window.COOKIFY_AUTH.registerUser(email, password, name);
        
        if (registerResult.success) {
          // Success - proceed to next page (session is managed by Flask)
          document.body.classList.remove("fade-in");
          setTimeout(() => { window.location.href = "Cookify - Ingredients.html"; }, 500);
        } else {
          // Registration failed
          showAuthError(registerResult.message);
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Registration error:', error);
        showAuthError('Registration failed. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// TheMealDB API configuration: TheMealDB is free and doesn't require an API key.
// Base URL is configured in config.js for consistency.
const THEMEALDB_BASE_URL = (typeof window !== 'undefined' && window.COOKIFY_CONFIG && window.COOKIFY_CONFIG.THEMEALDB_BASE_URL) || 'https://www.themealdb.com/api/json/v1/1';

function pickCategoryImage(data) {
  const title = (data.title || '').toLowerCase();
  const dishTypes = Array.isArray(data.dishTypes) ? data.dishTypes.map(x => String(x).toLowerCase()) : [];
  const cuisines = Array.isArray(data.cuisines) ? data.cuisines.map(x => String(x).toLowerCase()) : [];
  const hay = [title, ...dishTypes, ...cuisines].join(' ');

  const IMG = {
    pasta: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bbf?q=80&w=1200&auto=format&fit=crop',
    salad: 'https://images.unsplash.com/photo-1566843972145-5cd4a05aa5a3?q=80&w=1200&auto=format&fit=crop',
    dessert: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop',
    soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
    pizza: 'https://images.unsplash.com/photo-1548365328-9f547fb095a0?q=80&w=1200&auto=format&fit=crop',
    sandwich: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop',
    curry: 'https://images.unsplash.com/photo-1604908176997-431664c7432f?q=80&w=1200&auto=format&fit=crop',
    rice: 'https://images.unsplash.com/photo-1604908554020-6be3f9b81a18?q=80&w=1200&auto=format&fit=crop',
    egg: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    breakfast: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?q=80&w=1200&auto=format&fit=crop',
    indian: 'https://images.unsplash.com/photo-1588167056549-1c3be539c9a5?q=80&w=1200&auto=format&fit=crop',
    italian: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1200&auto=format&fit=crop',
    chinese: 'https://images.unsplash.com/photo-1604907991364-6f5f7955da24?q=80&w=1200&auto=format&fit=crop',
    mexican: 'https://images.unsplash.com/photo-1526312426976-593c64aeb2ab?q=80&w=1200&auto=format&fit=crop'
  };

  if (/pizza/.test(hay)) return IMG.pizza;
  if (/(pasta|spaghetti|penne)/.test(hay)) return IMG.pasta;
  if (/(salad|greens)/.test(hay)) return IMG.salad;
  if (/(soup|broth)/.test(hay)) return IMG.soup;
  if (/(sandwich|burger|wrap)/.test(hay)) return IMG.sandwich;
  if (/(curry|masala|gravy)/.test(hay)) return IMG.curry;
  if (/(rice|biryani|pilaf|pulao)/.test(hay)) return IMG.rice;
  if (/(omelette|omelet|egg)/.test(hay)) return IMG.egg;
  if (/(breakfast|pancake|waffle|toast)/.test(hay)) return IMG.breakfast;
  if (/(indian)/.test(hay)) return IMG.indian;
  if (/(italian)/.test(hay)) return IMG.italian;
  if (/(chinese|noodles|stir[- ]?fry)/.test(hay)) return IMG.chinese;
  if (/(mexican|taco|quesadilla|burrito)/.test(hay)) return IMG.mexican;
  if (/(dessert|cake|brownie|cookie|ice cream)/.test(hay)) return IMG.dessert;
  return '';
}

function getBestImageForRecipe(r) {
  const id = r && r.id;
  const img = r && (r.image || r.imageUrl);
  if (img && typeof img === 'string' && img.trim()) return img;
  const cat = pickCategoryImage(r || {});
  return cat || '';
}

function makePlaceholder(title) {
  const t = (title || 'Recipe').slice(0, 24);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='480'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='%23fff5e1'/>
        <stop offset='100%' stop-color='%23ffd93d'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(%23g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%235a4635' font-family='Poppins, Arial' font-size='36'>🍲 ${t}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Smooth fade-out before leaving page
document.querySelectorAll("a, button").forEach(element => {
  element.addEventListener("click", e => {
    const href = element.getAttribute("href");
    if (href && href.endsWith(".html")) {
      e.preventDefault();
      document.body.classList.remove("fade-in");
      setTimeout(() => {
        window.location.href = href;
      }, 500); // wait for fade-out
    }
  });
});

// TheMealDB API doesn't require an API key - it's completely free!
// This function is kept for compatibility but always returns null
// since no API key is needed for TheMealDB
async function getApiKey() {
  // TheMealDB is free and doesn't require an API key
  return null;
}

// TheMealDB API is free and doesn't require any API key setup.
// All API calls work without authentication.

function getIngredientsFromStorage() {
  try {
    const raw = localStorage.getItem('cookify_ingredients');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch(_) { return []; }
}

function getCustomRecipesFromStorage() {
  try {
    const raw = localStorage.getItem('cookify_custom_recipes');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch(_) { return []; }
}

function saveCustomRecipe(recipe) {
  const list = getCustomRecipesFromStorage();
  list.unshift(recipe);
  try { localStorage.setItem('cookify_custom_recipes', JSON.stringify(list)); } catch(_) {}
  return list;
}

function renderRecipes(list, container) {
  container.innerHTML = '';
  if (!list || list.length === 0) {
    const d = document.createElement('div');
    d.textContent = 'No recipes found.';
    container.appendChild(d);
    return;
  }
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.addEventListener('click', () => {
      try {
        const sugg = Array.isArray(r.missedIngredients) ? r.missedIngredients.map(mi => mi.name).filter(Boolean) : [];
        localStorage.setItem(`cookify_suggestions_${r.id}`, JSON.stringify(sugg));
        // Persist minimal selected recipe info for details fallback rendering
        const minimal = {
          id: r.id,
          title: r.title || 'Recipe',
          image: r.image || r.imageUrl || '',
          vegetarian: typeof r.vegetarian === 'boolean' ? r.vegetarian : undefined,
          dishTypes: Array.isArray(r.dishTypes) ? r.dishTypes : undefined,
          cuisines: Array.isArray(r.cuisines) ? r.cuisines : undefined
        };
        localStorage.setItem('cookify_selected_recipe', JSON.stringify(minimal));
      } catch(_) {}
      window.location.href = `Cookify - Recipe Details.html?id=${encodeURIComponent(r.id)}`;
    });
    const badge = document.createElement('span');
    badge.className = 'icon-badge';
    badge.textContent = '🍽️';
    const dot = document.createElement('span');
    dot.className = 'diet-dot ' + (r.vegetarian === true ? 'veg' : (r.vegetarian === false ? 'non-veg' : ''));
    const img = document.createElement('img');
    img.loading = 'lazy';
    const initialSrc = getBestImageForRecipe(r);
    img.src = initialSrc || makePlaceholder(r.title || 'Recipe');
    img.onerror = () => { img.onerror = null; img.src = makePlaceholder(r.title || 'Recipe'); };
    img.alt = r.title || 'Recipe';
    const info = document.createElement('div');
    info.className = 'recipe-info';
    const h3 = document.createElement('h3');
    h3.textContent = r.title || 'Recipe';
    const p = document.createElement('p');
    let tag = '';
    if (typeof r.missedIngredientCount === 'number') {
      const unusedUser = r.unusedUserIngredients || 0;
      const additionalNeeded = r.missedIngredientCount;
      const usedCount = r.usedIngredientCount || 0;
      
      // Check if it's a perfect match (uses all user ingredients with minimal additional)
      if (unusedUser === 0 && additionalNeeded <= 2) {
        if (additionalNeeded === 0) {
          tag = '✨ Perfect Match - No additional ingredients needed!';
        } else {
          tag = `✨ Perfect Match - Only ${additionalNeeded} missing ingredient${additionalNeeded > 1 ? 's' : ''} needed`;
        }
      } else {
        // Simplified display: only show used and additional needed
        if (additionalNeeded === 0) {
          tag = `${usedCount} ingredient${usedCount !== 1 ? 's' : ''} used`;
        } else {
          tag = `${usedCount} used • ${additionalNeeded} missing`;
        }
      }
    } else if (Array.isArray(r.missedIngredients)) {
      const c = r.missedIngredients.length;
      tag = c === 0 ? '✨ Perfect Match' : `${c} missing`;
    }
    p.textContent = tag || 'Recipe match';
    info.appendChild(h3);
    info.appendChild(p);
    card.appendChild(badge);
    card.appendChild(dot);
    card.appendChild(img);
    card.appendChild(info);

    if (r.missedIngredients && r.missedIngredients.length) {
      const miss = document.createElement('div');
      const ul = document.createElement('ul');
      ul.className = 'missing-list';
      
      // Sort missing ingredients by frequency (most used to least used)
      const sortedMissing = [...r.missedIngredients].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        
        // Get user ingredients for frequency comparison
        const userIngredients = JSON.parse(localStorage.getItem('cookify_ingredients') || '[]');
        const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase());
        
        // Count frequency of similar ingredients in user's list
        const getFrequencyScore = (ingredientName) => {
          let score = 0;
          userIngredientsLower.forEach(userIng => {
            if (userIng.includes(ingredientName) || ingredientName.includes(userIng)) {
              score++;
            }
          });
          return score;
        };
        
        const scoreA = getFrequencyScore(nameA);
        const scoreB = getFrequencyScore(nameB);
        
        // Sort by frequency (descending), then alphabetically
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return nameA.localeCompare(nameB);
      });
      
      // Limit to maximum 3 ingredients
      sortedMissing.slice(0, 3).forEach(mi => {
        const li = document.createElement('li');
        li.textContent = mi.name || '';
        ul.appendChild(li);
      });
      miss.appendChild(ul);
      card.appendChild(miss);
    }

    container.appendChild(card);
  });
}

// Enhanced ingredient alternatives for better TheMealDB matching
function getIngredientAlternatives(ingredient) {
  const alternatives = {
    'sugar': ['caster sugar', 'brown sugar', 'granulated sugar', 'icing sugar'],
    'flour': ['plain flour', 'all-purpose flour', 'wheat flour', 'self-raising flour'],
    'milk': ['whole milk', 'dairy milk', 'cow milk', 'semi-skimmed milk'],
    'butter': ['unsalted butter', 'salted butter', 'margarine'],
    'eggs': ['egg', 'chicken eggs', 'free-range eggs'],
    'egg': ['eggs', 'chicken egg', 'free-range egg'],
    'vanilla': ['vanilla extract', 'vanilla essence', 'vanilla pod'],
    'salt': ['table salt', 'sea salt', 'kosher salt'],
    'pepper': ['black pepper', 'ground pepper', 'white pepper'],
    'oil': ['vegetable oil', 'cooking oil', 'olive oil', 'sunflower oil'],
    'cheese': ['cheddar cheese', 'mozzarella cheese', 'parmesan cheese'],
    'cream': ['heavy cream', 'whipping cream', 'double cream', 'single cream'],
    'yogurt': ['greek yogurt', 'plain yogurt', 'natural yogurt'],
    'lemon': ['lemon juice', 'fresh lemon', 'lemon zest'],
    'garlic': ['garlic cloves', 'fresh garlic', 'garlic powder'],
    'onion': ['yellow onion', 'white onion', 'red onion', 'spring onion'],
    'tomato': ['fresh tomato', 'ripe tomato', 'cherry tomato', 'plum tomato'],
    'potato': ['potatoes', 'russet potato', 'new potato', 'sweet potato'],
    'chicken': ['chicken breast', 'chicken thighs', 'chicken drumsticks'],
    'beef': ['ground beef', 'beef mince', 'beef steak', 'beef chunks'],
    'rice': ['white rice', 'long grain rice', 'basmati rice', 'jasmine rice'],
    'pasta': ['spaghetti', 'penne pasta', 'fusilli', 'linguine'],
    'herbs': ['fresh herbs', 'mixed herbs', 'dried herbs'],
    'spices': ['mixed spices', 'ground spices'],
    'bread': ['white bread', 'brown bread', 'wholemeal bread'],
    'fish': ['white fish', 'salmon', 'cod', 'haddock'],
    'mushrooms': ['button mushrooms', 'chestnut mushrooms', 'portobello mushrooms']
  };
  
  return alternatives[ingredient.toLowerCase()] || [];
}

// Enhanced API call with retry mechanism
async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API call attempt ${attempt}/${maxRetries}: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`API call successful on attempt ${attempt}`);
      return data;
    } catch (error) {
      console.warn(`API call attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
}

// Backup recipe database for when APIs fail
function getBackupRecipes(ingredients = []) {
  const backupRecipes = [
    {
      id: 'backup_pancakes',
      title: 'Fluffy Pancakes',
      image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1200&auto=format&fit=crop',
      usedIngredientCount: ingredients.filter(ing => ['flour', 'milk', 'eggs', 'sugar', 'butter'].includes(ing.toLowerCase())).length,
      missedIngredientCount: 3,
      unusedUserIngredients: Math.max(0, ingredients.length - 3),
      totalRecipeIngredients: 6,
      vegetarian: true,
      perfectMatchScore: 2,
      category: 'Breakfast'
    },
    {
      id: 'backup_pasta',
      title: 'Simple Pasta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1200&auto=format&fit=crop',
      usedIngredientCount: ingredients.filter(ing => ['pasta', 'tomato', 'garlic', 'oil', 'cheese'].includes(ing.toLowerCase())).length,
      missedIngredientCount: 2,
      unusedUserIngredients: Math.max(0, ingredients.length - 4),
      totalRecipeIngredients: 5,
      vegetarian: true,
      perfectMatchScore: 3,
      category: 'Main Course'
    },
    {
      id: 'backup_salad',
      title: 'Fresh Garden Salad',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
      usedIngredientCount: ingredients.filter(ing => ['lettuce', 'tomato', 'cucumber', 'onion'].includes(ing.toLowerCase())).length,
      missedIngredientCount: 1,
      unusedUserIngredients: Math.max(0, ingredients.length - 3),
      totalRecipeIngredients: 4,
      vegetarian: true,
      perfectMatchScore: 4,
      category: 'Salad'
    },
    {
      id: 'backup_stirfry',
      title: 'Quick Vegetable Stir Fry',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
      usedIngredientCount: ingredients.filter(ing => ['vegetables', 'oil', 'garlic', 'soy sauce', 'rice'].includes(ing.toLowerCase())).length,
      missedIngredientCount: 2,
      unusedUserIngredients: Math.max(0, ingredients.length - 4),
      totalRecipeIngredients: 6,
      vegetarian: true,
      perfectMatchScore: 3,
      category: 'Main Course'
    },
    {
      id: 'backup_soup',
      title: 'Hearty Vegetable Soup',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
      usedIngredientCount: ingredients.filter(ing => ['vegetables', 'broth', 'onion', 'carrot', 'potato'].includes(ing.toLowerCase())).length,
      missedIngredientCount: 3,
      unusedUserIngredients: Math.max(0, ingredients.length - 3),
      totalRecipeIngredients: 7,
      vegetarian: true,
      perfectMatchScore: 2,
      category: 'Soup'
    }
  ];
  
  // Sort by how many user ingredients are used
  return backupRecipes.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
}

// Cache cleanup utility
function cleanExpiredCache() {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('ingredient_') || key.startsWith('meal_detail_')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key));
          if (data.expires && Date.now() > data.expires) {
            sessionStorage.removeItem(key);
          }
        } catch (e) {
          sessionStorage.removeItem(key); // Remove corrupted entries
        }
      }
    });
  } catch (e) {} // Ignore errors
}

async function initRecipesPage() {
  // Clean expired cache on page load
  cleanExpiredCache();
  
  const perfectEl = document.getElementById('perfectResults');
  const partialEl = document.getElementById('partialResults');
  const ing = getIngredientsFromStorage();
  
  // Debug information
  console.log('Initializing recipes page...');
  console.log('Raw ingredients from storage:', ing);
  console.log('Perfect results element:', perfectEl ? 'found' : 'not found');
  console.log('Partial results element:', partialEl ? 'found' : 'not found');
  
  // Initialize loading state
  let isLoading = true;
  let hasResults = false;
  
  // Add keyboard shortcut to show debug panel (Ctrl+D)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      const debugPanel = document.getElementById('debugPanel');
      if (debugPanel) {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
  // Normalize common variants to improve API matching (e.g., 'capsicum' -> 'bell pepper')
  const normalizeIngredients = (arr) => {
    const map = new Map([
      ['capsicum', 'bell pepper'],
      ['capsicums', 'bell peppers'],
      ['brinjal', 'eggplant'],
      ['courgette', 'zucchini'],
      ['aubergine', 'eggplant'],
      ['corn flour', 'cornstarch'],
      ['icing sugar', 'powdered sugar'],
      ['castor sugar', 'caster sugar'],
      ['biscuits', 'cookies'],
      ['tomatoes', 'tomato'],
      ['onions', 'onion'],
      ['eggs', 'egg']
    ]);
    const drop = new Set(['sauce', 'masala', 'spices', 'seasoning']);
    return arr
      .map(x => (x || '').toLowerCase().trim())
      .filter(Boolean)
      .map(x => map.get(x) || x)
      .filter(x => !drop.has(x));
  };
  const ingNormalized = normalizeIngredients(ing);
  const custom = getCustomRecipesFromStorage();
  
  // Enhanced debug logging
  console.log('Normalized ingredients:', ingNormalized);
  console.log('Custom recipes:', custom);
  
  // Test with a simple ingredient if we have ingredients
  if (ingNormalized.length > 0) {
    console.log('Testing API with first ingredient:', ingNormalized[0]);
    const testUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingNormalized[0])}`;
    console.log('Test API URL:', testUrl);
  }
  
  // Update debug panel with complete information
  const debugInfo = document.getElementById('debugInfo');
  if (debugInfo) {
    debugInfo.innerHTML = `
      <p><strong>Raw ingredients from storage:</strong> ${JSON.stringify(ing)}</p>
      <p><strong>Normalized ingredients:</strong> ${JSON.stringify(ingNormalized)}</p>
      <p><strong>Page elements:</strong> Perfect: ${perfectEl ? '✓' : '✗'}, Partial: ${partialEl ? '✓' : '✗'}</p>
      <p><strong>Custom recipes count:</strong> ${custom.length}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleTimeString()}</p>
      <p><strong>User Agent:</strong> ${navigator.userAgent.substring(0, 50)}...</p>
      <p><strong>API Test:</strong> <span id="apiTestResult">Testing...</span></p>
    `;
    
    // Test API connectivity
    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken')
      .then(response => response.json())
      .then(data => {
        const apiTestResult = document.getElementById('apiTestResult');
        if (apiTestResult) {
          if (data && data.meals && data.meals.length > 0) {
            apiTestResult.innerHTML = '✓ API Working';
            apiTestResult.style.color = 'green';
          } else {
            apiTestResult.innerHTML = '⚠ API returned no results';
            apiTestResult.style.color = 'orange';
          }
        }
      })
      .catch(error => {
        const apiTestResult = document.getElementById('apiTestResult');
        if (apiTestResult) {
          apiTestResult.innerHTML = '✗ API Failed: ' + error.message;
          apiTestResult.style.color = 'red';
        }
      });
  }
  const modal = document.getElementById('perfectMatchModal');
  const closeBtn = document.getElementById('closePerfect');
  if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  // filter buttons
  const filters = document.getElementById('dietFilters');
  let activeFilter = 'GLOBAL';
  // cache in closure scope early so we can update it in any branch
  let cachedResults = null;
  // API Key UI wiring
  // TheMealDB API key management is not needed since the API is free
  // Remove any existing API key UI elements if present
  const apiKeyBar = document.getElementById('apiKeyBar');
  if (apiKeyBar) {
    apiKeyBar.style.display = 'none';
  }
  if (filters) {
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeFilter = btn.dataset.filter || 'GLOBAL';
      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (cachedResults) applyAndRender(activeFilter);
    });
  }

  // If no ingredients, show custom recipes and some popular default recipes
  if (!ingNormalized.length) {
    console.log('No ingredients found in storage, showing default recipes');
    
    // Add some popular default recipes when no ingredients are provided
    const defaultRecipes = [
      {
        id: 'default_1',
        title: 'Classic Pancakes',
        image: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
        usedIngredientCount: 0,
        missedIngredientCount: 5,
        unusedUserIngredients: 0,
        totalRecipeIngredients: 5,
        vegetarian: true,
        perfectMatchScore: -5
      },
      {
        id: 'default_2',
        title: 'Chicken Teriyaki',
        image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
        usedIngredientCount: 0,
        missedIngredientCount: 6,
        unusedUserIngredients: 0,
        totalRecipeIngredients: 6,
        vegetarian: false,
        perfectMatchScore: -6
      },
      {
        id: 'default_3',
        title: 'Vegetable Stir Fry',
        image: 'https://www.themealdb.com/images/media/meals/z7b4f31589769837.jpg',
        usedIngredientCount: 0,
        missedIngredientCount: 4,
        unusedUserIngredients: 0,
        totalRecipeIngredients: 4,
        vegetarian: true,
        perfectMatchScore: -4
      },
      {
        id: 'default_4',
        title: 'Spaghetti Bolognese',
        image: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg',
        usedIngredientCount: 0,
        missedIngredientCount: 7,
        unusedUserIngredients: 0,
        totalRecipeIngredients: 7,
        vegetarian: false,
        perfectMatchScore: -7
      },
      {
        id: 'default_5',
        title: 'Caesar Salad',
        image: 'https://www.themealdb.com/images/media/meals/x7tdxw1560180315.jpg',
        usedIngredientCount: 0,
        missedIngredientCount: 5,
        unusedUserIngredients: 0,
        totalRecipeIngredients: 5,
        vegetarian: true,
        perfectMatchScore: -5
      }
    ];
    
    cachedResults = [...custom, ...defaultRecipes];
    applyAndRender(activeFilter);
    return;
  }

  // Show loading indicator
  if (perfectEl) {
    perfectEl.innerHTML = '<div class="loading">🔍 Finding perfect matches...</div>';
  }
  if (partialEl) {
    partialEl.innerHTML = '<div class="loading">⏳ Loading recipes from TheMealDB...</div>';
  }

  // TheMealDB: Parallel ingredient fetching for better performance
  const ingredientResults = new Map(); // mealId => { id, title, image, matched, totalIngredients }
  try {
    // Parallel API calls with caching - MAJOR PERFORMANCE BOOST
    const ingredientPromises = ingNormalized.map(async (item) => {
      try {
        // Check cache first
        const cacheKey = `ingredient_${item}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            // Check if cache is still valid
            if (cachedData.expires && Date.now() < cachedData.expires) {
              return { ingredient: item, meals: cachedData.meals || [], cached: true };
            } else {
              // Cache expired, remove it
              sessionStorage.removeItem(cacheKey);
            }
          } catch (e) {
            // Corrupted cache, remove it
            sessionStorage.removeItem(cacheKey);
          }
        }

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(item)}`;
        const data = await fetchWithRetry(url, 2, 500); // 2 retries with 500ms delay
        const meals = Array.isArray(data.meals) ? data.meals : [];
        
        // Cache the result for 1 hour
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ 
            meals, 
            timestamp: Date.now(),
            expires: Date.now() + (60 * 60 * 1000) // 1 hour
          }));
        } catch (e) {} // Ignore storage errors
        
        return { ingredient: item, meals };
      } catch (e) {
        return { ingredient: item, meals: [] };
      }
    });

    const ingredientResponses = await Promise.all(ingredientPromises);
    
    // Debug: Log ingredient search results
    console.log('Ingredient search results:', ingredientResponses.map(r => ({
      ingredient: r.ingredient,
      mealCount: r.meals.length,
      cached: r.cached
    })));
    
    // Additional debug: Log total meals found
    const totalMealsFound = ingredientResponses.reduce((sum, r) => sum + r.meals.length, 0);
    console.log(`Total meals found across all ingredients: ${totalMealsFound}`);
    
    // Process results
    ingredientResponses.forEach(({ ingredient, meals }) => {
      meals.forEach(m => {
        const id = m.idMeal;
        if (!ingredientResults.has(id)) {
          ingredientResults.set(id, { 
            id, 
            title: m.strMeal, 
            image: m.strMealThumb, 
            matched: 0, 
            totalIngredients: 0,
            category: m.strCategory || '' // Store category for faster vegetarian detection
          });
        }
        const rec = ingredientResults.get(id);
        rec.matched += 1;
      });
    });

    console.log(`Found ${ingredientResults.size} unique recipes from ingredient search`);

    // Enhanced fallback system with multiple strategies
    if (ingredientResults.size === 0) {
      console.log('No results from primary search, implementing comprehensive fallback strategies');
      
      // Strategy 1: Try alternative ingredient names
      const alternativeSearches = [];
      for (const ingredient of ingNormalized) {
        const alternatives = getIngredientAlternatives(ingredient);
        if (alternatives.length > 0) {
          alternativeSearches.push(...alternatives.map(alt => ({ original: ingredient, alternative: alt })));
        }
      }
      
      if (alternativeSearches.length > 0) {
        console.log('Trying alternative ingredient names:', alternativeSearches.slice(0, 10));
        const altPromises = alternativeSearches.slice(0, 10).map(async ({ original, alternative }) => {
          try {
            const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(alternative)}`;
            const data = await fetchWithRetry(url, 2, 300);
            return { original, alternative, meals: Array.isArray(data.meals) ? data.meals : [] };
          } catch (e) {
            console.log(`Alternative search failed for "${alternative}":`, e.message);
            return { original, alternative, meals: [] };
          }
        });
        
        const altResults = await Promise.all(altPromises);
        altResults.forEach(({ original, alternative, meals }) => {
          if (meals.length > 0) {
            console.log(`Found ${meals.length} recipes using alternative "${alternative}" for "${original}"`);
            meals.forEach(m => {
              const id = m.idMeal;
              if (!ingredientResults.has(id)) {
                ingredientResults.set(id, { 
                  id, 
                  title: m.strMeal, 
                  image: m.strMealThumb, 
                  matched: 1, 
                  totalIngredients: 0,
                  category: m.strCategory || ''
                });
              }
            });
          }
        });
      }
      
      // Strategy 2: Try broader category searches if still no results
      if (ingredientResults.size === 0) {
        console.log('Trying category-based searches...');
        const categorySearches = ['chicken', 'pasta', 'vegetarian', 'dessert', 'breakfast'];
        
        for (const category of categorySearches) {
          try {
            const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${category}`;
            const data = await fetchWithRetry(url, 1, 200);
            if (data.meals && data.meals.length > 0) {
              console.log(`Found ${data.meals.length} recipes in ${category} category`);
              data.meals.slice(0, 3).forEach(m => { // Limit to 3 per category
                const id = m.idMeal;
                if (!ingredientResults.has(id)) {
                  ingredientResults.set(id, {
                    id,
                    title: m.strMeal,
                    image: m.strMealThumb,
                    matched: 0,
                    totalIngredients: 0,
                    category: m.strCategory || category
                  });
                }
              });
              break; // Stop after finding first successful category
            }
          } catch (e) {
            console.log(`Category search failed for ${category}:`, e.message);
          }
        }
      }
      
      // Strategy 3: Use backup recipe database as last resort
      if (ingredientResults.size === 0) {
        console.log('Using backup recipe database');
        const backupRecipes = getBackupRecipes(ingNormalized);
        backupRecipes.forEach(recipe => {
          ingredientResults.set(recipe.id, {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            matched: recipe.usedIngredientCount,
            totalIngredients: recipe.totalRecipeIngredients,
            category: recipe.category
          });
        });
      }
    }

    // Optimize: Only fetch details for top candidates to reduce API calls
    const sortedByMatch = Array.from(ingredientResults.values())
      .sort((a, b) => b.matched - a.matched)
      .slice(0, 30); // Only get details for top 30 matches - HUGE PERFORMANCE BOOST

    // Parallel detail fetching for remaining candidates
    const detailPromises = sortedByMatch.map(async (basicInfo) => {
      try {
        // Check cache first
        const cacheKey = `meal_detail_${basicInfo.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          return { ...basicInfo, totalIngredients: cachedData.totalIngredients, cached: true };
        }

        const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(basicInfo.id)}`;
        const detailData = await fetchWithRetry(detailUrl, 2, 300);
        const meal = detailData && detailData.meals && detailData.meals[0];
        if (meal) {
          // Count actual ingredients in the recipe
          let totalIngredients = 0;
          const recipeIngredients = [];
          
          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
              totalIngredients++;
              recipeIngredients.push({
                name: ingredient.trim(),
                measure: measure ? measure.trim() : ''
              });
            }
          }
          
          // Enhanced caching with more details
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ 
              totalIngredients,
              ingredients: recipeIngredients,
              category: meal.strCategory,
              area: meal.strArea,
              instructions: meal.strInstructions,
              timestamp: Date.now(),
              expires: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
            }));
          } catch (e) {} // Ignore storage errors
          
          return { 
            ...basicInfo, 
            totalIngredients,
            category: meal.strCategory,
            area: meal.strArea,
            recipeIngredients
          };
        }
        
        // Fallback with estimated count
        return { ...basicInfo, totalIngredients: Math.max(basicInfo.matched, 5) };
      } catch (e) {
        return { ...basicInfo, totalIngredients: Math.max(basicInfo.matched, 5) };
      }
    });

    const enrichedCandidates = await Promise.all(detailPromises);
    
    // Create enriched results map
    const enrichedResults = new Map();
    enrichedCandidates.forEach(candidate => {
      enrichedResults.set(candidate.id, candidate);
    });
    
    // Add remaining recipes with estimated ingredient counts (no API calls needed)
    for (const [mealId, basicInfo] of ingredientResults) {
      if (!enrichedResults.has(mealId)) {
        enrichedResults.set(mealId, { 
          ...basicInfo, 
          totalIngredients: Math.max(basicInfo.matched + 2, 5) // Conservative estimate
        });
      }
    }

    const userIngredientCount = ingNormalized.length;
    // Convert to list with proper perfect match logic
    const mealsList = Array.from(enrichedResults.values()).map(r => {
      const usedIngredientCount = r.matched;
      const totalRecipeIngredients = r.totalIngredients;
      
      // Perfect match: uses ALL user ingredients AND requires minimal additional ingredients
      const additionalIngredientsNeeded = Math.max(0, totalRecipeIngredients - usedIngredientCount);
      const userIngredientsNotUsed = Math.max(0, userIngredientCount - usedIngredientCount);
      
      return {
        id: r.id,
        title: r.title,
        image: r.image,
        usedIngredientCount: usedIngredientCount,
        missedIngredientCount: additionalIngredientsNeeded, // Additional ingredients needed for the recipe
        unusedUserIngredients: userIngredientsNotUsed, // User ingredients not used in this recipe
        totalRecipeIngredients: totalRecipeIngredients,
        vegetarian: undefined,
        perfectMatchScore: usedIngredientCount - additionalIngredientsNeeded // Higher is better
      };
    });

    // Fast vegetarian detection using already available category data - NO ADDITIONAL API CALLS
    const meatCats = new Set(['Beef','Chicken','Pork','Lamb','Goat','Seafood']);
    const vegCats = new Set(['Vegetarian','Vegan']);
    
    mealsList.forEach(r => {
      // Use category from initial fetch or enriched data
      const category = r.category || '';
      if (vegCats.has(category)) {
        r.vegetarian = true;
      } else if (meatCats.has(category)) {
        r.vegetarian = false;
      }
      // Leave undefined for unknown categories
    });

    // Merge with any custom recipes, dedupe by id
    const all = [...custom, ...mealsList];
    const seen = new Set();
    const merged = [];
    all.forEach(r => { if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); } });

    // Show perfect-match modal if any (perfect = uses all user ingredients with minimal additional)
    const perfectExists = merged.some(r => {
      const usesAllUserIngredients = (r.unusedUserIngredients || 0) === 0;
      const hasMinimalAdditional = (r.missedIngredientCount || 0) <= 2; // Allow up to 2 additional ingredients
      return usesAllUserIngredients && hasMinimalAdditional;
    });
    if (perfectExists && modal) { modal.style.display = 'flex'; }

    // Sort: Best perfect match score first (uses more ingredients, needs fewer additional), then fewer missing, then more used
    merged.sort((x, y) => {
      // Primary sort: Perfect match score (higher is better)
      const scoreX = x.perfectMatchScore || (x.usedIngredientCount || 0) - (x.missedIngredientCount || 0);
      const scoreY = y.perfectMatchScore || (y.usedIngredientCount || 0) - (y.missedIngredientCount || 0);
      if (scoreX !== scoreY) return scoreY - scoreX;
      
      // Secondary sort: Fewer additional ingredients needed
      const mx = typeof x.missedIngredientCount === 'number' ? x.missedIngredientCount : 999;
      const my = typeof y.missedIngredientCount === 'number' ? y.missedIngredientCount : 999;
      if (mx !== my) return mx - my;
      
      // Tertiary sort: More user ingredients used
      const ux = x.usedIngredientCount || 0; 
      const uy = y.usedIngredientCount || 0;
      if (ux !== uy) return uy - ux;
      
      // Final sort: Fewer unused user ingredients
      const unx = x.unusedUserIngredients || 0;
      const uny = y.unusedUserIngredients || 0;
      return unx - uny;
    });

    cachedResults = merged;
    
    // Mark loading as complete and show results
    isLoading = false;
    hasResults = cachedResults && cachedResults.length > 0;
    
    console.log(`Recipe loading complete. Found ${cachedResults ? cachedResults.length : 0} recipes`);
    
    // Show results immediately
    applyAndRender(activeFilter);
  } catch (err) {
    console.error('Error loading recipes:', err);
    isLoading = false;
    
    // Show error state
    if (perfectEl) {
      perfectEl.innerHTML = `<div style="color: #c33; padding: 20px; text-align: center;">
        <h4>⚠️ Failed to load recipes</h4>
        <p>TheMealDB API Error: ${err.message}</p>
        <p>Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #ff6b35; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>`;
    }
    if (partialEl) {
      partialEl.innerHTML = `<div style="color: #666; padding: 20px; text-align: center;">
        <p>Unable to fetch recipes at this time.</p>
        <p>You can still browse the default recipes above or try again later.</p>
      </div>`;
    }
  }

  function applyAndRender(filter) {
    // Don't render if still loading or no cached results
    if (isLoading || !cachedResults) {
      console.log('applyAndRender: Still loading or no cached results, skipping render');
      return;
    }
    
    const listAll = cachedResults.slice();
    console.log(`applyAndRender: Starting with ${listAll.length} recipes, filter: ${filter}`);
    
    let list = listAll;
    if (filter === 'VEG') {
      list = list.filter(r => r.vegetarian === true);
      console.log(`After VEG filter: ${list.length} recipes`);
    } else if (filter === 'NON_VEG') {
      list = list.filter(r => r.vegetarian === false);
      console.log(`After NON_VEG filter: ${list.length} recipes`);
    }

    const getMissing = (r) => {
      if (typeof r.missedIngredientCount === 'number') return r.missedIngredientCount;
      if (Array.isArray(r.missedIngredients)) return r.missedIngredients.length;
      return null;
    };

    let perfect = [];
    let partial = [];
    const MAX_MISSING = 15;

    if (!ingNormalized.length) {
      // No ingredient context: show everything under partial
      perfect = [];
      partial = list;
      console.log(`No ingredients provided: ${partial.length} recipes in partial`);
    } else {
      // With ingredients: ignore recipes with >15 missing; include unknown under partial
      const eligible = list.filter(r => {
        const m = getMissing(r);
        return m === null || m <= MAX_MISSING;
      });
      console.log(`After MAX_MISSING filter (${MAX_MISSING}): ${eligible.length} eligible recipes`);
      
      // Perfect match: uses all user ingredients with minimal additional ingredients
      perfect = eligible.filter(r => {
        const additionalNeeded = getMissing(r);
        const unusedUser = r.unusedUserIngredients || 0;
        const isPerfect = unusedUser === 0 && additionalNeeded !== null && additionalNeeded <= 2;
        if (isPerfect) {
          console.log(`Perfect match found: ${r.title}, missing: ${additionalNeeded}, unused: ${unusedUser}`);
        }
        return isPerfect;
      });
      
      partial = eligible.filter(r => {
        const m = getMissing(r);
        const unusedUser = r.unusedUserIngredients || 0;
        
        // Exclude perfect matches from partial results
        const isPerfectMatch = unusedUser === 0 && m !== null && m <= 2;
        if (isPerfectMatch) return false;
        
        // Include recipes with at least 50% ingredient match
        const usedCount = r.usedIngredientCount || 0;
        const totalUserIngredients = userIngredientCount;
        const matchPercentage = totalUserIngredients > 0 ? (usedCount / totalUserIngredients) * 100 : 0;
        
        // Include if: has at least 50% ingredient match AND doesn't exceed max missing ingredients
        const hasGoodMatch = matchPercentage >= 50;
        const withinMissingLimit = m === null || m <= MAX_MISSING;
        
        if (hasGoodMatch && withinMissingLimit) {
          console.log(`Partial match: ${r.title}, used: ${usedCount}/${totalUserIngredients} (${matchPercentage.toFixed(1)}%), missing: ${m}`);
        }
        
        return hasGoodMatch && withinMissingLimit;
      });
      
      console.log(`Final results: ${perfect.length} perfect, ${partial.length} partial matches`);
    }

    // Show modal if perfect exists
    const perfectExists = perfect.length > 0;
    if (perfectExists && modal) { modal.style.display = 'flex'; }

    // Render results with proper error handling
    if (perfectEl) {
      if (perfect.length) {
        console.log(`Rendering ${perfect.length} perfect matches`);
        renderRecipes(perfect, perfectEl);
      } else {
        perfectEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">
          <p>No perfect matches found.</p>
          ${ingNormalized.length ? '<p>Try adjusting your ingredients or check partial matches below.</p>' : ''}
        </div>`;
      }
    }
    
    if (partialEl) {
      if (partial.length) {
        console.log(`Rendering ${partial.length} partial matches`);
        renderRecipes(partial, partialEl);
      } else {
        if (!ingNormalized.length) {
          partialEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">
            <h3>🍽️ Welcome to Recipe Discovery!</h3>
            <p>To get personalized recipe recommendations:</p>
            <ol style="text-align: left; display: inline-block; margin: 15px 0;">
              <li>Go to the <a href="Cookify - Ingredients.html" style="color: #ff6b35; text-decoration: none; font-weight: 600;">ingredients page</a></li>
              <li>Enter the ingredients you have available</li>
              <li>Click "Find Recipes" to see personalized matches</li>
            </ol>
            <p style="margin-top: 15px;">Or browse the popular recipes shown above! 👆</p>
          </div>`;
        } else {
          partialEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">
            <h4>No matches found with current filter</h4>
            <p><strong>Searched with:</strong> ${ingNormalized.join(', ')}</p>
            <div style="margin: 15px 0;">
              <p>Try:</p>
              <ul style="text-align: left; display: inline-block;">
                <li>Adding more common ingredients</li>
                <li>Being more specific (e.g., 'soy sauce' instead of 'sauce')</li>
                <li>Switching the diet filter above</li>
                <li>Checking your spelling</li>
              </ul>
            </div>
          </div>`;
        }
      }
    }
    
    console.log('applyAndRender: Rendering complete');
  }

  // Search feature removed from UI; no live search hookup
}

// Debug helper functions
function testWithIngredients(ingredients) {
  console.log('Testing with ingredients:', ingredients);
  try {
    localStorage.setItem('cookify_ingredients', JSON.stringify(ingredients));
    console.log('Ingredients saved to localStorage, reloading page...');
    window.location.reload();
  } catch (e) {
    console.error('Failed to save ingredients:', e);
  }
}

function clearIngredients() {
  console.log('Clearing ingredients from localStorage');
  try {
    localStorage.removeItem('cookify_ingredients');
    console.log('Ingredients cleared, reloading page...');
    window.location.reload();
  } catch (e) {
    console.error('Failed to clear ingredients:', e);
  }
}

async function initRecipeDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  // TheMealDB lookup
  const infoUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
  try {
    const a = await fetch(infoUrl);
    const info = await a.json();
    const meal = info && info.meals && info.meals[0];
    const titleEl = document.getElementById('recipeTitle');
    const imgEl = document.getElementById('recipeHero');
    const ingEl = document.getElementById('ingredientsList');
    const instEl = document.getElementById('instructions');
    const tryEl = document.getElementById('tryAdding');
    const procEl = document.getElementById('procedureList');
    if (titleEl) titleEl.textContent = (meal && meal.strMeal) || 'Recipe';
    if (imgEl) {
      imgEl.loading = 'lazy';
      const src = getBestImageForRecipe({ id, image: meal && meal.strMealThumb, title: meal && meal.strMeal });
      imgEl.src = src || makePlaceholder((meal && meal.strMeal) || 'Recipe');
      imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = makePlaceholder((meal && meal.strMeal) || 'Recipe'); };
    }
    if (ingEl && meal) {
      ingEl.innerHTML = '';
      for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const meas = meal[`strMeasure${i}`];
        if (name && name.trim()) {
          const li = document.createElement('li');
          li.textContent = [meas, name].filter(Boolean).join(' ').trim();
          ingEl.appendChild(li);
        }
      }
    }
    if (tryEl) {
      let suggestions = [];
      try {
        const raw = localStorage.getItem(`cookify_suggestions_${id}`);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) suggestions = parsed;
      } catch(_) {}
      if (!suggestions.length) {
        const title = ((meal && meal.strMeal) || '').toLowerCase();
        if (title.includes('pasta') || title.includes('italian')) {
          suggestions = ['fresh basil', 'parmesan', 'olive oil'];
        } else if (title.includes('omelette') || title.includes('egg')) {
          suggestions = ['chives', 'cheddar', 'black pepper'];
        } else if (title.includes('salad')) {
          suggestions = ['lemon juice', 'olive oil', 'feta'];
        } else {
          suggestions = ['salt', 'black pepper', 'lemon juice', 'fresh herbs'];
        }
      }
      tryEl.innerHTML = '';
      suggestions.forEach(s => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = s;
        tryEl.appendChild(span);
      });
    }
    // Build instructions/procedure from TheMealDB strInstructions
    const collectSteps = () => {
      if (meal && meal.strInstructions) {
        const tmp = document.createElement('div');
        tmp.innerHTML = meal.strInstructions;
        const plain = (tmp.textContent || tmp.innerText || '').trim();
        const parts = plain
          .split(/\n+|\s*\d+\.\s+/)
          .map(x => x.trim())
          .filter(Boolean);
        if (parts.length) return parts;
      }
      return [];
    };

    const steps = collectSteps();
    if (instEl) {
      if (steps.length) {
        instEl.innerHTML = steps.map((t, i) => `${i + 1}. ${t}`).join('<br>');
      } else {
        instEl.innerHTML = 'No instructions available.';
      }
    }
    if (procEl) {
      procEl.innerHTML = '';
      if (steps.length) {
        steps.forEach(t => {
          const li = document.createElement('li');
          li.textContent = t;
          procEl.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No procedure available.';
        procEl.appendChild(li);
      }
    }
  } catch(_) {
    // Fallback rendering from locally stored minimal selection if API key is missing or fetch failed
    try {
      const raw = localStorage.getItem('cookify_selected_recipe');
      const sel = raw ? JSON.parse(raw) : null;
      const titleEl = document.getElementById('recipeTitle');
      const imgEl = document.getElementById('recipeHero');
      const instEl = document.getElementById('instructions');
      const procEl = document.getElementById('procedureList');
      if (sel) {
        if (titleEl) titleEl.textContent = sel.title || 'Recipe';
        if (imgEl) {
          imgEl.loading = 'lazy';
          const src = getBestImageForRecipe({ id: sel.id, image: sel.image, title: sel.title, dishTypes: sel.dishTypes, cuisines: sel.cuisines });
          imgEl.src = src || makePlaceholder(sel.title || 'Recipe');
          imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = makePlaceholder(sel.title || 'Recipe'); };
        }
      }
      if (instEl) instEl.innerHTML = 'No instructions available.';
      if (procEl) { procEl.innerHTML = '<li>No procedure available.</li>'; }
    } catch(_) {}
  }
}