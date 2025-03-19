import { Scene } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Container, Control, Ellipse, Grid, Rectangle, StackPanel, TextBlock,Image, ScrollViewer} from "@babylonjs/gui"

export class ChainVilleUI {
    private scene: Scene;
    private advancedTexture: AdvancedDynamicTexture;
    
    // UI Elements
    private mainContainer: Container;
    private navigationPanel: Rectangle;
    private mainDisplay: Rectangle;
    private userProfile: Rectangle;
    private ctaButtons: Rectangle;
    private resourceBar: Rectangle;
    private buildingInterface: Rectangle;
    private miniMap: Rectangle;
    private actionBar: Rectangle;
    
    private buildingSelectionPanel: Rectangle;

    // State
    private selectedBuilding: { name: string, image: string, description: string } | null;

    // Color constants for the updated functionality
    readonly HOVER_COLOR: string = "#333333";

    // Theme Colors
    private readonly PRIMARY_COLOR = "#1E8449"; // Dark Green
    private readonly SECONDARY_COLOR = "#2ECC71"; // Bright Green
    private readonly ACCENT_COLOR = "#82E0AA"; // Light Green
    private readonly TEXT_COLOR = "#FFFFFF"; // White
    private readonly BACKGROUND_COLOR = "#0A2A12"; // Very Dark Green
    private readonly PANEL_COLOR = "#0E3D1A"; // Dark Green Panel

        // Additional Theme Colors
    private readonly WARNING_COLOR = "#F39C12";  // Orange / Warning
    private readonly ERROR_COLOR = "#C0392B";    // Red / Error
    private readonly INFO_COLOR = "#3498DB";     // Blue / Informational
    private readonly SUCCESS_COLOR = "#27AE60";  // Green / Success
    private readonly DISABLED_COLOR = "#7F8C8D"; // Greyed Out / Disabled

        // Additional Text Colors
    private readonly HEADING_COLOR = "#FDFEFE";   // Bright white for headings
    private readonly SUBHEADING_COLOR = "#ECF0F1";  // Slightly off-white for subheadings
    private readonly CAPTION_COLOR = "#BDC3C7";     // Lighter grey for captions
    private readonly PLACEHOLDER_TEXT_COLOR = "#95A5A6"; // Grey for placeholder text
    private readonly LINK_COLOR = "#5DADE2";        // Bright blue for clickable links
    private readonly DISABLED_TEXT_COLOR = "#7F8C8D"; // Muted grey for disabled text


    // Additional Text Colors - Bold, Vibrant, etc.
    private readonly CYAN_COLOR = "#17A2B8";      // Vibrant Cyan
    private readonly MAGENTA_COLOR = "#FF00FF";   // Magenta
    private readonly YELLOW_COLOR = "#FFFF00";    // Bright Yellow
    private readonly PURPLE_COLOR = "#9B59B6";    // Deep Purple
    private readonly ORANGE_COLOR = "#FFA500";    // Bright Orange
    private readonly TEAL_COLOR = "#008080";      // Classic Teal

    // Current View
    private currentView: string = "dashboard";
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("ChainVilleUI", true, scene);
        
        // Main container for all UI elements
        this.mainContainer = new Container("mainContainer");
        this.mainContainer.width = 1;
        this.mainContainer.height = 1;
        this.advancedTexture.addControl(this.mainContainer);
        
        this.createUI();
    }
    
    private createUI(): void {
        // 1. Create Navigation Panel (Left Side)
        this.createNavigationPanel();

        // 2. Create Main Display (Center)
        this.createMainDisplay();
        
        // 3. Create User Profile (Top Right)
        this.createUserProfile();
        
        // 4. Create CTA Buttons (Bottom)
        this.createCTAButtons();
    }
    
    private createDashboard(): void {
        // Clear previous UI if any
        this.mainContainer.clearControls();
        this.currentView = "dashboard";
        
        // Create background
        const background = new Rectangle("background");
        background.width = 1;
        background.height = 1;
        background.color = this.BACKGROUND_COLOR;
        background.thickness = 0;
        background.background = this.BACKGROUND_COLOR;
        this.mainContainer.addControl(background);
        

    }
    
    private createNavigationPanel(): void {
        // Create navigation panel as a rectangle for more flexibility
        this.navigationPanel = new Rectangle("navigationPanel");
        this.navigationPanel.width = "250px";
        this.navigationPanel.height = "600px";
        this.navigationPanel.cornerRadius = 10;
        this.navigationPanel.background = this.PANEL_COLOR;
        this.navigationPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.navigationPanel.thickness = 0;
        this.mainContainer.addControl(this.navigationPanel);
        
         // Create header container to hold logo and title
         const headerContainer = new Rectangle("headerContainer");
         headerContainer.width = "100%";
         headerContainer.height = "60px";
         headerContainer.thickness = 0;
         headerContainer.background = this.BACKGROUND_COLOR;
         headerContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
         headerContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
         this.navigationPanel.addControl(headerContainer);
         
        // Create grid for flexible layout
        const headerGrid = new Grid("headerGrid");
        headerGrid.addColumnDefinition(0.25); // For logo
        headerGrid.addColumnDefinition(0.75); // For title
        headerGrid.width = 1;
        headerGrid.height = 1;
        headerContainer.addControl(headerGrid);
        
        // App logo cell
        const logoContainer = new Rectangle("logoContainer");
        logoContainer.thickness = 0;
        logoContainer.background = "transparent"; 
        
        // App logo
        const logoText = new TextBlock("logoText");
        logoText.text = "🏙️";
        logoText.fontSize = 36;
        logoText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        logoText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        logoContainer.addControl(logoText);
        
        // App title cell
        const titleContainer = new Rectangle("titleContainer");
        titleContainer.thickness = 0;
        titleContainer.background = "transparent";
        
        // App title
        const titleText = new TextBlock("titleText");
        titleText.text = "ChainVille";
        titleText.color = this.CYAN_COLOR;
        titleText.fontSize = 28;
        titleText.fontStyle = "bold";
        titleText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        titleContainer.addControl(titleText);
        
        // Add containers to grid
        headerGrid.addControl(logoContainer, 0, 0);
        headerGrid.addControl(titleContainer, 0, 1);
        
                // Navigation options definition
                const navOptions = [
                    { text: "🏠 Home", id: "home" },
                    { text: "🌆 City Overview", id: "cityOverview" },
                    { text: "📊 Resources", id: "resources" },
                    { text: "💰 Economy", id: "economy" },
                    { text: "🏆 Leaderboard", id: "leaderboard" },
                    { text: "⚙️ Settings", id: "settings" }
                ];
        
                // Navigation buttons - using a more straightforward approach
                const navPanel = new StackPanel("navPanel");
                navPanel.width = "100%";
                navPanel.top = "70px"; // Position below header
                navPanel.spacing = 10; // Space between buttons
                navPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                navPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                navPanel.paddingLeft = "10px";
                navPanel.paddingRight = "10px";
                this.navigationPanel.addControl(navPanel);
                
                navOptions.forEach((option) => {
                    // Create button container
                    const navButton = new Rectangle(`navBtn-${option.id}`);
                    navButton.width = "230px";
                    navButton.height = "50px";
                    navButton.cornerRadius = 8;
                    navButton.thickness = 0;
                    navButton.background = this.PANEL_COLOR;
                    navButton.isPointerBlocker = true;
                    
                    // Create horizontal stack panel for icon and text
                    const buttonContentPanel = new StackPanel(`buttonContent-${option.id}`);
                    buttonContentPanel.isVertical = false; // Horizontal layout
                    buttonContentPanel.width = "100%";
                    buttonContentPanel.height = "100%";
                    navButton.addControl(buttonContentPanel);
                    
                    // Icon
                    const iconText = new TextBlock(`icon-${option.id}`);
                    iconText.text = option.text.split(" ")[0]; // Get emoji
                    iconText.width = "50px";
                    iconText.height = "100%";
                    iconText.fontSize = 24;
                    iconText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                    iconText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                    buttonContentPanel.addControl(iconText);
                    
                    // Text
                    const labelText = new TextBlock(`label-${option.id}`);
                    labelText.text = option.text.split(" ").slice(1).join(" "); // Get text without emoji
                    labelText.width = "180px";
                    labelText.height = "100%";
                    labelText.color = this.TEXT_COLOR;
                    labelText.fontSize = 18;
                    labelText.fontFamily = "Arial";
                    labelText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                    labelText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                    buttonContentPanel.addControl(labelText);
                    
                    // Hover and click events
                    navButton.onPointerEnterObservable.add(() => {
                        navButton.background = this.PRIMARY_COLOR;
                    });
                    
                    navButton.onPointerOutObservable.add(() => {
                        navButton.background = this.PANEL_COLOR;
                    });
                    
                    navButton.onPointerUpObservable.add(() => {
                        this.handleNavigation(option.id);
                    });
                    
                    // Add button to navigation panel
                    navPanel.addControl(navButton);
                });
    }
    
    private createMainDisplay(): void {
        // Create a dashboard panel that appears only in dashboard mode
        const dashboardPanel = new Rectangle("dashboardPanel");
        dashboardPanel.width = "300px";
        dashboardPanel.height = "400px";
        dashboardPanel.thickness = 2;
        dashboardPanel.color = this.PRIMARY_COLOR;
        dashboardPanel.cornerRadius = 10;
        dashboardPanel.background = this.PANEL_COLOR;
        dashboardPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        dashboardPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        dashboardPanel.top = "300px";
        dashboardPanel.alpha = 0.9; // Slightly transparent
        this.mainContainer.addControl(dashboardPanel);
        
        // Create a grid for the entire dashboard content
        const mainGrid = new Grid("mainGrid");
        mainGrid.width = 1;
        mainGrid.height = 1;
        
        // Define rows for different sections
        mainGrid.addRowDefinition(0.1);  // Header section (10%)
        mainGrid.addRowDefinition(0.6);  // Stats section (60%)
        mainGrid.addRowDefinition(0.3);  // Alerts section (30%)
        
        // Only one column for the entire width
        mainGrid.addColumnDefinition(1);
        
        dashboardPanel.addControl(mainGrid);
        
        // ===== HEADER SECTION =====
        const headerContainer = new Rectangle("headerContainer");
        headerContainer.thickness = 0;
        headerContainer.background = "transparent";
        
        const summaryHeader = new TextBlock("summaryHeader");
        summaryHeader.text = "City Summary";
        summaryHeader.color = this.TEXT_COLOR;
        summaryHeader.fontSize = 18;
        summaryHeader.fontStyle = "bold";
        summaryHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        summaryHeader.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        summaryHeader.paddingLeft = "10px";
        summaryHeader.paddingTop = "10px";
        
        headerContainer.addControl(summaryHeader);
        mainGrid.addControl(headerContainer, 0, 0);
        
        // ===== STATS SECTION =====
        const statsContainer = new Rectangle("statsContainer");
        statsContainer.thickness = 0;
        statsContainer.background = "transparent";
        
        // Create a grid for stats items
        const statsGrid = new Grid("statsGrid");
        statsGrid.width = 1;
        statsGrid.height = 1;
        statsGrid.paddingLeft = "10px";
        statsGrid.paddingRight = "10px";
        
        // Add a row for each stat item (6 items)
        for (let i = 0; i < 6; i++) {
            statsGrid.addRowDefinition(1/6);
        }
        
        // Add three columns for icon, label, and value
        statsGrid.addColumnDefinition(0.1);  // Icon (10%)
        statsGrid.addColumnDefinition(0.5);  // Label (50%)
        statsGrid.addColumnDefinition(0.4);  // Value (40%)
        
        statsContainer.addControl(statsGrid);
        
        // Quick Stats items
        const statItems = [
            { icon: "👥", label: "Population", value: "12,450" },
            { icon: "🏢", label: "Buildings", value: "87" },
            { icon: "⚡", label: "Power", value: "85%" },
            { icon: "💧", label: "Water", value: "78%" },
            { icon: "🌍", label: "Happiness", value: "92%" },
            { icon: "💰", label: "Treasury", value: "$1.24M" }
        ];
        
        statItems.forEach((stat, index) => {
            // Icon
            const iconText = new TextBlock(`icon-${index}`);
            iconText.text = stat.icon;
            iconText.fontSize = 16;
            iconText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            statsGrid.addControl(iconText, index, 0);
            
            // Label
            const labelText = new TextBlock(`label-${index}`);
            labelText.text = stat.label;
            labelText.color = this.ACCENT_COLOR;
            labelText.fontSize = 14;
            labelText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            statsGrid.addControl(labelText, index, 1);
            
            // Value
            const valueText = new TextBlock(`value-${index}`);
            valueText.text = stat.value;
            valueText.color = this.TEXT_COLOR;
            valueText.fontSize = 14;
            valueText.fontStyle = "bold";
            valueText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            statsGrid.addControl(valueText, index, 2);
        });
        
        mainGrid.addControl(statsContainer, 1, 0);
        
        // ===== ALERTS SECTION =====
        const alertsSection = new Rectangle("alertsSection");
        alertsSection.thickness = 0;
        alertsSection.background = "transparent";
        
        // Create a grid for alerts content
        const alertsGrid = new Grid("alertsGrid");
        alertsGrid.width = 1;
        alertsGrid.height = 1;
        
        // Define rows for alert header and alert items
        alertsGrid.addRowDefinition(0.25);  // Header (25%)
        alertsGrid.addRowDefinition(0.75);  // Alert items (75%)
        
        // Single column
        alertsGrid.addColumnDefinition(1);
        
        alertsSection.addControl(alertsGrid);
        
        // Alerts header
        const alertsHeaderContainer = new Rectangle("alertsHeaderContainer");
        alertsHeaderContainer.thickness = 0;
        alertsHeaderContainer.background = "transparent";
        
        const alertsHeader = new TextBlock("alertsHeader");
        alertsHeader.text = "City Alerts";
        alertsHeader.color = this.TEXT_COLOR;
        alertsHeader.fontSize = 18;
        alertsHeader.fontStyle = "bold";
        alertsHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        alertsHeader.paddingLeft = "10px";
        alertsHeaderContainer.addControl(alertsHeader);
        
        alertsGrid.addControl(alertsHeaderContainer, 0, 0);
        
        // Alerts list container
        const alertsListContainer = new Rectangle("alertsListContainer");
        alertsListContainer.thickness = 0;
        alertsListContainer.background = "transparent";
        
        // Create a grid for the alerts list
        const alertsListGrid = new Grid("alertsListGrid");
        alertsListGrid.width = 1;
        alertsListGrid.height = 1;
        alertsListGrid.paddingLeft = "10px";
        alertsListGrid.paddingRight = "10px";
        
        // Example alerts
        const alerts = [
            { text: "Water supply running low in District 3", icon: "⚠️" },
            { text: "Housing demand increasing", icon: "📈" }
        ];
        
        // Add rows for each alert
        for (let i = 0; i < alerts.length; i++) {
            alertsListGrid.addRowDefinition(1/alerts.length);
        }
        
        // Add columns for icon and text
        alertsListGrid.addColumnDefinition(0.1);  // Icon (10%)
        alertsListGrid.addColumnDefinition(0.9);  // Text (90%)
        
        alerts.forEach((alert, index) => {
            // Alert icon
            const alertIcon = new TextBlock(`alertIcon-${index}`);
            alertIcon.text = alert.icon;
            alertIcon.fontSize = 16;
            alertIcon.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            alertsListGrid.addControl(alertIcon, index, 0);
            
            // Alert text
            const alertText = new TextBlock(`alertText-${index}`);
            alertText.text = alert.text;
            alertText.color = this.TEXT_COLOR;
            alertText.fontSize = 14;
            alertText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            alertsListGrid.addControl(alertText, index, 1);
        });
        
        alertsListContainer.addControl(alertsListGrid);
        alertsGrid.addControl(alertsListContainer, 1, 0);
        
        mainGrid.addControl(alertsSection, 2, 0);
    }
    
private createUserProfile(): void {
    // Create user profile as a rectangle
    this.userProfile = new Rectangle("userProfile");
    this.userProfile.width = "280px";
    this.userProfile.height = "100px";
    this.userProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.userProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.userProfile.top = "65px";
    this.userProfile.left = "-20px"; // Use left offset instead of right
    this.userProfile.thickness = 1;
    this.userProfile.color = this.SECONDARY_COLOR;
    this.userProfile.cornerRadius = 10;
    this.userProfile.background = this.PANEL_COLOR;
    this.userProfile.alpha = 0.9;
    this.mainContainer.addControl(this.userProfile);
    
    // Create main grid layout exactly matching the sketch
    const profileGrid = new Grid("profileGrid");
    profileGrid.addColumnDefinition(0.3); // Left column for avatar (30%)
    profileGrid.addColumnDefinition(0.7); // Right column for info (70%)
    profileGrid.addRowDefinition(1); // Single row spans the whole grid
    profileGrid.width = 1;
    profileGrid.height = 1;
    this.userProfile.addControl(profileGrid);
    
    // Left column - Avatar (spans full height)
    const avatarContainer = new Rectangle("avatarContainer");
    avatarContainer.thickness = 0;
    avatarContainer.background = "transparent";
    
    // Avatar circle
    const avatar = new Ellipse("avatar");
    avatar.width = "70px";
    avatar.height = "70px";
    avatar.thickness = 3;
    avatar.color = this.SECONDARY_COLOR;
    avatar.background = this.PRIMARY_COLOR;
    
    // User icon
    const userIcon = new TextBlock("userIcon");
    userIcon.text = "👤";
    userIcon.fontSize = 36;
    avatar.addControl(userIcon);
    
    avatarContainer.addControl(avatar);
    
    // Right side requires its own grid with two rows
    const rightSideGrid = new Grid("rightSideGrid");
    rightSideGrid.addRowDefinition(0.5); // Top row (username)
    rightSideGrid.addRowDefinition(0.5); // Bottom row (stats)
    rightSideGrid.addColumnDefinition(1); // Single column
    rightSideGrid.width = 1;
    rightSideGrid.height = 1;
    
    // Top row - Username
    const usernameContainer = new Rectangle("usernameContainer");
    usernameContainer.thickness = 0;
    usernameContainer.background = "transparent";
    
    const username = new TextBlock("username");
    username.text = "Mayor GreenBuilder";
    username.color = this.TEXT_COLOR;
    username.fontSize = 18;
    username.fontStyle = "bold";
    username.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    username.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    username.paddingLeft = "10px";
    usernameContainer.addControl(username);
    
    // Bottom row - Stats with grid layout
    const statsContainer = new Rectangle("statsContainer");
    statsContainer.thickness = 0;
    statsContainer.background = "transparent";
    statsContainer.height = "60px";

    // Create a grid with one column and two rows
    const statsGrid = new Grid("statsGrid");
    statsGrid.addColumnDefinition(1);      // Single column (100%)
    statsGrid.addRowDefinition(0.5);       // First row (50%)
    statsGrid.addRowDefinition(0.5);       // Second row (50%)
    statsGrid.width = 1;
    statsGrid.height = 1;
    statsContainer.addControl(statsGrid);

    // Currency (gems) in first row
    const currencyContainer = new Rectangle("currencyContainer");
    currencyContainer.thickness = 0;
    currencyContainer.background = "transparent";

    const currency = new TextBlock("currency");
    currency.text = "💎 5,240 CV Gems";
    currency.color = this.ACCENT_COLOR;
    currency.fontSize = 16;
    currency.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    currency.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    currency.paddingLeft = "10px";
    currencyContainer.addControl(currency);

    // Level in second row
    const levelContainer = new Rectangle("levelContainer");
    levelContainer.thickness = 0;
    levelContainer.background = "transparent";

    const cityLevel = new TextBlock("cityLevel");
    cityLevel.text = "🏆 Level 12";
    cityLevel.color = this.ACCENT_COLOR;
    cityLevel.fontSize = 16;
    cityLevel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cityLevel.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    cityLevel.paddingLeft = "10px";
    levelContainer.addControl(cityLevel);

    // Add controls to the grid - one column, two rows
    statsGrid.addControl(currencyContainer, 0, 0); // row 0, column 0
    statsGrid.addControl(levelContainer, 1, 0);    // row 1, column 0

    
    // Add containers to the right side grid
    rightSideGrid.addControl(usernameContainer, 0, 0);
    rightSideGrid.addControl(statsContainer, 1, 0);
    
    // Add main components to main grid
    profileGrid.addControl(avatarContainer, 0, 0);
    profileGrid.addControl(rightSideGrid, 0, 1);
}
    
    private createCTAButtons(): void {
        // Create a container rectangle for the CTA buttons
        this.ctaButtons = new Rectangle("ctaButtons");
        this.ctaButtons.width = "280px";
        this.ctaButtons.height = "180px";
        this.ctaButtons.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.ctaButtons.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.ctaButtons.top = "110px";
       //his.ctaButtons.right = "20px";
        this.ctaButtons.thickness = 0;
        this.ctaButtons.cornerRadius = 5;
        this.mainContainer.addControl(this.ctaButtons);
        
        // Create main action buttons
        const buttonConfigs = [
            { text: "🏗️ Start Building", id: "startBuilding" },
            { text: "📦 Manage Resources", id: "manageResources" },
            { text: "⬆️ Upgrade City", id: "upgradeCity" }
        ];
        
        buttonConfigs.forEach((config, index) => {
            const button = new Rectangle(`ctaBtn-${config.id}`);
            button.width = "280px";
            button.height = "50px";
            button.cornerRadius = 10;
            button.thickness = 2;
            button.color = this.PANEL_COLOR;
            button.background = this.BACKGROUND_COLOR;
            button.top = `${index * 60}px`;
            button.shadowBlur = 5;
            button.shadowColor = "black";
            button.shadowOffsetX = 2;
            button.shadowOffsetY = 2;
            button.isPointerBlocker = true;
            
            const buttonText = new TextBlock(`ctaText-${config.id}`);
            buttonText.text = config.text;
            buttonText.color = this.TEXT_COLOR;
            buttonText.fontSize = 18;
            buttonText.fontStyle = "bold";
            button.addControl(buttonText);
            
            button.onPointerEnterObservable.add(() => {
                button.background = this.PRIMARY_COLOR;
                button.scaleX = 1.05;
                button.scaleY = 1.05;
            });
            
            button.onPointerOutObservable.add(() => {
                button.background = this.BACKGROUND_COLOR;
                button.scaleX = 1;
                button.scaleY = 1;
            });
            
            button.onPointerUpObservable.add(() => {
                this.handleCTAAction(config.id);
            });
            
            this.ctaButtons.addControl(button);
        });
        
        // Create city-building interface components (initially hidden)
        this.createCityBuildingInterface();
    }
    
    private createCityBuildingInterface(): void {
        // Resource bar (top)
        this.resourceBar = new Rectangle("resourceBar");
        this.resourceBar.width = 1;
        this.resourceBar.height = "60px";
        this.resourceBar.background = this.PANEL_COLOR;
        this.resourceBar.thickness = 0;
        this.resourceBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.resourceBar.isVisible = true;
        this.resourceBar.alpha = 0.9; // Slightly transparent
        this.mainContainer.addControl(this.resourceBar);
        
        // Add resource indicators to the resource bar
        const resourceGrid = new Grid("resourceGrid");
        resourceGrid.addColumnDefinition(0.2);
        resourceGrid.addColumnDefinition(0.2);
        resourceGrid.addColumnDefinition(0.2);
        resourceGrid.addColumnDefinition(0.2);
        resourceGrid.addColumnDefinition(0.2);
        resourceGrid.width = 0.7;
        resourceGrid.height = 1;
        resourceGrid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        resourceGrid.left = "260px"; // Space for navigation panel
        this.resourceBar.addControl(resourceGrid);
        
        const resources = [
            { icon: "👛", name: "Wallet", value: "0x71C7...F3a2" },
            { icon: "👥", name: "Population", value: "12,450" },
            { icon: "🏢", name: "Total Assets", value: "247 NFTs" },
            { icon: "💰", name: "Treasury", value: "$1.24M" },
            { icon: "🌐", name: "Network", value: "Connected" }
        ];
        
        resources.forEach((resource, index) => {
            const resourceContainer = new StackPanel(`resource-${index}`);
            resourceContainer.isVertical = false;
            resourceContainer.height = "40px";
            resourceContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            
            const resourceIcon = new TextBlock(`resourceIcon-${index}`);
            resourceIcon.text = resource.icon;
            resourceIcon.width = "30px";
            resourceIcon.fontSize = 18;
            
            const resourceInfo = new StackPanel(`resourceInfo-${index}`);
            resourceInfo.width = "100px";
            
            const resourceName = new TextBlock(`resourceName-${index}`);
            resourceName.text = resource.name;
            resourceName.color = this.ACCENT_COLOR;
            resourceName.fontSize = 12;
            resourceName.height = "15px";
            
            const resourceValue = new TextBlock(`resourceValue-${index}`);
            resourceValue.text = resource.value;
            resourceValue.color = this.TEXT_COLOR;
            resourceValue.fontSize = 14;
            resourceValue.height = "20px";
            resourceValue.fontStyle = "bold";
            
            resourceInfo.addControl(resourceName);
            resourceInfo.addControl(resourceValue);
            
            resourceContainer.addControl(resourceIcon);
            resourceContainer.addControl(resourceInfo);
            
            resourceGrid.addControl(resourceContainer, 0, index);
        });
        
        // Building sidebar (left) - should be semi-transparent to still see the scene
        this.buildingInterface = new Rectangle("buildingInterface");
        this.buildingInterface.width = "250px";
        this.buildingInterface.height = "400px";
        this.buildingInterface.top = "60px";
        this.buildingInterface.cornerRadius = 10
        this.buildingInterface.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.buildingInterface.background = this.PANEL_COLOR;
        this.buildingInterface.thickness = 0;
        this.buildingInterface.alpha = 0.85; // Semi-transparent
        this.buildingInterface.isVisible = false;
        this.mainContainer.addControl(this.buildingInterface);
        
        // Add building categories to sidebar
        const buildingPanel = new StackPanel("buildingPanel");
        buildingPanel.width = 1;
        buildingPanel.paddingTop = "10px";
        buildingPanel.spacing = 5;
        this.buildingInterface.addControl(buildingPanel);
        
        // Building categories
        const categories = [
            { name: "Residential", icon: "🏠", color: "#7DCEA0" },
            { name: "Commercial", icon: "🏪", color: "#5DADE2" },
            { name: "Industrial", icon: "🏭", color: "#E59866" },
            { name: "Utilities", icon: "⚡", color: "#F4D03F" },
            { name: "Parks", icon: "🌳", color: "#58D68D" },
            { name: "Roads", icon: "🛣️", color: "#AAB7B8" },
            { name: "Special", icon: "🏛️", color: "#BB8FCE" }
        ];
        
        // Category header
        const categoryHeader = new TextBlock("categoryHeader");
        categoryHeader.text = "Building Types";
        categoryHeader.color = this.TEXT_COLOR;
        categoryHeader.fontSize = 18;
        categoryHeader.fontStyle = "bold";
        categoryHeader.height = "30px";
        categoryHeader.paddingLeft = "10px";
        categoryHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        buildingPanel.addControl(categoryHeader);
        
        categories.forEach((category, index) => {
            const categoryButton = Button.CreateSimpleButton(`category-${index}`, `${category.icon} ${category.name}`);
            categoryButton.width = "90%";
            categoryButton.height = "40px";
            categoryButton.color = this.TEXT_COLOR;
            categoryButton.cornerRadius = 8;
            categoryButton.background = category.color;
            categoryButton.fontSize = 16;
            categoryButton.shadowBlur = 5;
            categoryButton.shadowOffsetX = 2;
            categoryButton.shadowOffsetY = 2;
            categoryButton.shadowColor = "black";
            
            categoryButton.onPointerEnterObservable.add(() => {
                categoryButton.scaleX = 1.05;
                categoryButton.scaleY = 1.05;
            });
            
            categoryButton.onPointerOutObservable.add(() => {
                categoryButton.scaleX = 1;
                categoryButton.scaleY = 1;
            });
            
            // Add click event to show buildings in this category
            categoryButton.onPointerClickObservable.add(() => {
                // Deselect any previously selected category button
                categories.forEach((_, i) => {
                    const button = this.mainContainer.getChildByName(`category-${i}`) as Button;
                    if (button) {
                        button.background = categories[i].color;
                        button.color = this.TEXT_COLOR;
                    }
                });
                
                // Highlight the selected category
                categoryButton.background = this.TEXT_COLOR;
                categoryButton.color = category.color;
                
                // Show buildings for this category
                this.showBuildingsInCategory(category.name);
            });
            
            buildingPanel.addControl(categoryButton);
        });
        
        // Mini-map (bottom right)
        this.miniMap = new Rectangle("miniMap");
        this.miniMap.width = "200px";
        this.miniMap.height = "200px";
        this.miniMap.cornerRadius = 10;
        this.miniMap.color = this.PRIMARY_COLOR;
        this.miniMap.thickness = 2;
        this.miniMap.background = this.BACKGROUND_COLOR;
        this.miniMap.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.miniMap.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.miniMap.top = "-15px";
        this.miniMap.left = "-20px";
        this.miniMap.isVisible = false;
        this.miniMap.alpha = 0.9; // Slightly transparent
        
        // Add mini-map title
        const mapTitle = new TextBlock("mapTitle");
        mapTitle.text = "Mini Map";
        mapTitle.color = this.TEXT_COLOR;
        mapTitle.fontSize = 14;
        mapTitle.height = "20px";
        mapTitle.top = "5px";
        this.miniMap.addControl(mapTitle);
        
        // Add placeholder for map content - this would be replaced with actual rendered map
        const mapPlaceholder = new Ellipse("mapPlaceholder");
        mapPlaceholder.width = "160px";
        mapPlaceholder.height = "160px";
        mapPlaceholder.thickness = 1;
        mapPlaceholder.background = "#1E5631";
        mapPlaceholder.top = "10px";
        this.miniMap.addControl(mapPlaceholder);
        
        this.mainContainer.addControl(this.miniMap);
        
        // Action bar (bottom)
        const actionBar = new Rectangle("actionBar");
        actionBar.width = "600px";
        actionBar.height = "60px";
        actionBar.cornerRadius = 10;
        actionBar.color = this.PRIMARY_COLOR;
        actionBar.thickness = 2;
        actionBar.background = this.PANEL_COLOR;
        actionBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        actionBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        actionBar.top = "-20px";
        actionBar.alpha = 0.9;
        actionBar.isVisible = false;
        
        // Add action buttons
        const actionGrid = new Grid("actionGrid");
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.width = 0.9;
        actionGrid.height = 0.8;
        actionBar.addControl(actionGrid);
        
        const actions = [
            { icon: "🔨", name: "Build" },
            { icon: "🔧", name: "Modify" },
            { icon: "🧹", name: "Clear" },
            { icon: "🔍", name: "Inspect" },
            { icon: "📊", name: "Stats" }
        ];
        
        actions.forEach((action, index) => {
            const actionButton = Button.CreateSimpleButton(`action-${index}`, `${action.icon}\n${action.name}`);
            actionButton.width = "90px";
            actionButton.height = "40px";
            actionButton.color = this.TEXT_COLOR;
            actionButton.cornerRadius = 8;
            actionButton.background = this.BACKGROUND_COLOR;
            actionButton.fontSize = 14;
            
            actionButton.onPointerEnterObservable.add(() => {
                actionButton.background = this.PRIMARY_COLOR;
            });
            
            actionButton.onPointerOutObservable.add(() => {
                actionButton.background = this.BACKGROUND_COLOR;
            });
            
            actionGrid.addControl(actionButton, 0, index);
        });
        
        this.mainContainer.addControl(actionBar);
        
        // Store the action bar reference for visibility toggling
        this.actionBar = actionBar;
    }



    private showBuildingsInCategory(categoryName: string): void {
        // Close previous building selection panel if open
        if (this.buildingSelectionPanel) {
            this.buildingSelectionPanel.dispose();
        }
        
        // Create a new building selection panel
        this.buildingSelectionPanel = new Rectangle("buildingSelectionPanel");
        this.buildingSelectionPanel.width = "280px";
        this.buildingSelectionPanel.height = "500px";
        this.buildingSelectionPanel.cornerRadius = 10;
        this.buildingSelectionPanel.background = this.PANEL_COLOR;
        this.buildingSelectionPanel.thickness = 0;
        this.buildingSelectionPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.buildingSelectionPanel.left = "260px"; // Position it to the right of the building categories panel
        this.buildingSelectionPanel.top = "60px";
        this.buildingSelectionPanel.alpha = 0.9;
        this.mainContainer.addControl(this.buildingSelectionPanel);
        
        // Create a Grid for the header area
        const headerGrid = new Grid("headerGrid");
        headerGrid.addColumnDefinition(0.85); // Title column
        headerGrid.addColumnDefinition(0.15); // Close button column
        headerGrid.addRowDefinition(1); // Single row
        headerGrid.height = "40px";
        headerGrid.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        headerGrid.background = this.PRIMARY_COLOR; // Use the primary color for header
        
        this.buildingSelectionPanel.addControl(headerGrid);
        
        // Create header title
        const headerTitle = new TextBlock("headerTitle");
        headerTitle.text = categoryName + " Buildings";
        headerTitle.color = this.TEXT_COLOR;
        headerTitle.fontSize = 18;
        headerTitle.fontStyle = "bold";
        headerTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerTitle.paddingLeft = "15px";
        
        // Add title to first column (0) of first row (0)
        headerGrid.addControl(headerTitle, 0, 0);
        
        // Create close button container
        const closeButton = new Rectangle("closeButtonContainer");
        closeButton.width = "24px";
        closeButton.height = "24px";
        closeButton.cornerRadius = 12;
        closeButton.background = this.ACCENT_COLOR; // Use accent color for button
        closeButton.thickness = 0;
        closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        // Add close button to second column (1) of first row (0)
        headerGrid.addControl(closeButton, 0, 1);
        
        // Create X text for close button
        const closeText = new TextBlock("closeText");
        closeText.text = "✕";
        closeText.color = "white";
        closeText.fontSize = 12;
        closeText.fontStyle = "bold";
        closeButton.addControl(closeText);
        
        // Add hover effect
        closeButton.onPointerEnterObservable.add(() => {
            closeButton.background = this.HOVER_COLOR; // Hover color
        });
        
        closeButton.onPointerOutObservable.add(() => {
            closeButton.background = this.ACCENT_COLOR; // Back to accent color
        });
        
        // Add click event
        closeButton.onPointerClickObservable.add(() => {
            this.buildingSelectionPanel.dispose();
            //this.buildingSelectionPanel = null;
        });
        
        
        // Create a scrollable panel for the building options
        const scrollViewer = new ScrollViewer("buildingScrollViewer");
        scrollViewer.width = 0.95;
        scrollViewer.height = 0.85;
        scrollViewer.top = "50px";
        scrollViewer.thickness = 0;
        this.buildingSelectionPanel.addControl(scrollViewer);
        
        // Create a panel for the building options
        const optionsPanel = new StackPanel("buildingOptionsPanel");
        optionsPanel.width = "100%";
        optionsPanel.spacing = 10;
        optionsPanel.paddingTop = "10px";
        optionsPanel.paddingBottom = "10px";
        scrollViewer.addControl(optionsPanel);
        
        // Get buildings for the selected category (placeholder data - replace with actual building data)
        const buildings = this.getBuildingsForCategory(categoryName);
        
        // Add building options to the panel
        buildings.forEach((building, index) => {
            // Create the main option container
            const option = new Rectangle(`buildingOption-${index}`);
            option.width = "90%";
            option.height = "80px";
            option.cornerRadius = 8;
            option.background = this.BACKGROUND_COLOR;
            option.thickness = 1;
            option.color = this.PRIMARY_COLOR;
            
            // Create a 2×2 grid layout
            const grid = new Grid();
            grid.width = "100%";
            grid.height = "100%";
            
            // Configure grid columns and rows
            grid.addColumnDefinition(0.3); // Image column (30%)
            grid.addColumnDefinition(0.7); // Text column (70%)
            grid.addRowDefinition(0.5);    // Name row (50%)
            grid.addRowDefinition(0.5);    // Description row (50%)
            option.addControl(grid);
            
            // Building image in the left cell spanning both rows
            const image = new Image(`buildingImage-${index}`, building.image);
            image.width = "40px";
            image.height = "40px";
            image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            
            // Add image to left column, spanning both rows
            const imageContainer = new Rectangle("imageContainer");
            imageContainer.thickness = 0;
            imageContainer.background = "transparent";
            imageContainer.addControl(image);
            grid.addControl(imageContainer, 0, 0);
            grid.addControl(imageContainer, 1, 0);
            
            // Building name in the top-right cell
            const nameText = new TextBlock(`buildingName-${index}`);
            nameText.text = building.name;
            nameText.color = this.TEXT_COLOR;
            nameText.fontSize = 16;
            nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            nameText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            nameText.leftInPixels = 10; // Add padding
            nameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            grid.addControl(nameText, 0, 1);
            
            // Building description in the bottom-right cell with enhanced TextBlock
            const descText = new TextBlock(`buildingDesc-${index}`);
            descText.text = building.description;
            descText.color = this.ACCENT_COLOR;
            descText.fontSize = 12;
            descText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            descText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            descText.leftInPixels = 10; // Add padding
            descText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP; // Align to top for better text wrapping
            descText.topInPixels = 5; // Add some top padding

            // Enable text wrapping
            descText.textWrapping = true;
            descText.resizeToFit = false;
            descText.height = "100%";
            descText.width = "95%"; // Slightly less than 100% to ensure text doesn't touch the edge

            // Create a container with a scroll viewer if you need scrolling
            const descContainer = new Rectangle(`descContainer-${index}`);
            descContainer.thickness = 0;
            descContainer.background = "transparent";
            descContainer.width = "100%";
            descContainer.height = "100%";
            descContainer.addControl(descText);

            grid.addControl(descContainer, 1, 1);
            
            // Hover effects
            option.onPointerEnterObservable.add(() => {
                option.background = this.HOVER_COLOR;
            });
            
            option.onPointerOutObservable.add(() => {
                option.background = this.BACKGROUND_COLOR;
            });
            
            // Click event - select this building
            option.onPointerClickObservable.add(() => {
                this.selectBuilding(building);
            });
            
            // Add the completed option to the panel
            optionsPanel.addControl(option);
        });
    }
    
    // Helper method to get buildings for a specific category
    private getBuildingsForCategory(categoryName: string): Array<{name: string, image: string, description: string}> {
        // This is placeholder data - in a real implementation, this would come from your data source
        // For now, we'll just generate some sample buildings based on the category
        const buildings = [];
        
        switch(categoryName) {
            case "Residential":
                buildings.push(
                    { name: "Small House", image: "file1.png", description: "1-2 residents, low cost" },
                    { name: "Apartment", image: "file2.png", description: "10-20 residents, medium cost" },
                    { name: "Luxury Condo", image: "file3.png", description: "5-10 residents, high value" },
                    { name: "Suburban Home", image: "file4.png", description: "3-5 residents, medium cost" }
                );
                break;
            case "Commercial":
                buildings.push(
                    { name: "Small Shop", image: "file5.png", description: "5 jobs, low tax income" },
                    { name: "Office Building", image: "file6.png", description: "50 jobs, medium tax income" },
                    { name: "Mall", image: "file7.png", description: "100 jobs, high tax income" },
                    { name: "Restaurant", image: "file8.png", description: "15 jobs, medium tax income" }
                );
                break;
            case "Industrial":
                buildings.push(
                    { name: "Factory", image: "file9.png", description: "75 jobs, high pollution" },
                    { name: "Warehouse", image: "file10.png", description: "25 jobs, low pollution" },
                    { name: "Power Plant", image: "file11.png", description: "30 jobs, very high pollution" }
                );
                break;
            // Add cases for other categories as needed
            default:
                // Default case for other categories
                for(let i = 1; i <= 5; i++) {
                    buildings.push({ 
                        name: `${categoryName} Building ${i}`, 
                        image: `file${Math.floor(Math.random() * 20) + 1}.png`,
                        description: `Sample ${categoryName.toLowerCase()} building`
                    });
                }
        }
        
        return buildings;
    }
    
    // Method to handle building selection
    private selectBuilding(building: {name: string, image: string, description: string}): void {
        console.log(`Selected building: ${building.name}`);
        
        // Set the current building selection
        this.selectedBuilding = building;
        
        // Update UI to show the selected building is active
        // You could highlight the selection, show details, etc.
        
        // Enable building placement mode
        this.enableBuildingPlacementMode();
        
        // Optionally close the building selection panel
        // this.buildingSelectionPanel.isVisible = false;
    }
    
    // Method to enable building placement mode
    private enableBuildingPlacementMode(): void {
        // This method would handle the logic for placing the selected building on the map
        // For example, creating a ghost building that follows the mouse
        // and allowing the user to click to place it
        
        console.log(`Building placement mode enabled for: ${this.selectedBuilding?.name}`);
        
        // Show a notification or change cursor to indicate building placement mode
        const notification = new TextBlock("placementNotification");
        notification.text = `Click on the map to place ${this.selectedBuilding?.name}`;
        notification.color = this.ACCENT_COLOR;
        notification.fontSize = 16;
        notification.height = "30px";
        notification.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        notification.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        notification.top = "70px";
        notification.outlineWidth = 1;
        notification.outlineColor = "black";
        
        // Remove after a few seconds
        setTimeout(() => {
            this.mainContainer.removeControl(notification);
        }, 3000);
        
        this.mainContainer.addControl(notification);
        
        // In a real implementation, you would set up event listeners for the 3D scene
        // to handle the actual building placement
    }
    
    // Handle navigation clicks
    private handleNavigation(destination: string): void {
        console.log(`Navigating to: ${destination}`);
        
        switch(destination) {
            case "home":
                this.switchToDashboard();
                break;
            case "cityOverview":
                this.switchToCityView();
                break;
            case "resources":
                this.switchToResourcesView();
                break;
            case "economy":
                // Implement economy view
                break;
            case "leaderboard":
                // Implement leaderboard view
                break;
            case "settings":
                // Implement settings view
                break;
            default:
                break;
        }
    }
    
    // Handle CTA button clicks
    private handleCTAAction(action: string): void {
        console.log(`CTA action: ${action}`);
        
        switch(action) {
            case "startBuilding":
                this.switchToCityView();
                break;
            case "manageResources":
                this.switchToResourcesView();
                break;
            case "upgradeCity":
                // Implement upgrade view
                break;
            default:
                break;
        }
    }
    
    // Switch to Dashboard view
    private switchToDashboard(): void {
        if (this.currentView !== "dashboard") {
            this.currentView = "dashboard";
            
            // Hide city-building elements
            this.resourceBar.isVisible = true;
            this.actionBar.isVisible = false;
            this.buildingInterface.isVisible = false;
            this.miniMap.isVisible = false;
            
            // Show dashboard elements
            this.userProfile.isVisible = true;
            this.ctaButtons.isVisible = true;
            
            // The 3D scene is always visible in the background
        }
    }
    
    // Switch to City Building view
    private switchToCityView(): void {
        if (this.currentView !== "cityView") {
            this.currentView = "cityView";
            
            // Hide dashboard elements
            this.ctaButtons.isVisible = false;
            
            // Show city-building elements
            this.resourceBar.isVisible = true;
            this.buildingInterface.isVisible = true;
            this.miniMap.isVisible = true;
            this.actionBar.isVisible = true;
            
            // Keep user profile visible
            this.userProfile.isVisible = true;
            
            console.log("Switched to City Building view");
            
            // The 3D scene remains visible in the center
        }
    }
    
    // Switch to Resources view
    private switchToResourcesView(): void {
        if (this.currentView !== "resourcesView") {
            this.currentView = "resourcesView";
            console.log("Switched to Resources view");
            
            // Future implementation for resources interface
        }
    }
    
    // Public method to dispose UI
    public dispose(): void {
        this.advancedTexture.dispose();
    }
}