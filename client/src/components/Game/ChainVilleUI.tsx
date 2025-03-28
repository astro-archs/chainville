import { Color4, Observable, Scene } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Container, Control, Ellipse, Grid, Rectangle, StackPanel, TextBlock,Image, ScrollViewer} from "@babylonjs/gui"
// Import model categories
import modelCategories from './models';
import { ToastType } from "../../types/types";

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
    private actionGrid: Grid;
    
    private buildingSelectionPanel: Rectangle;

        // Add to your UI class
    private modelSelectPanel: Rectangle;
    private modelGrid: Grid;
    private activeCategory: string | null = null;
    private modelContainer: StackPanel;
    private dashboardPanel: Rectangle;

    private selectedResource: { model: string, category: string } | null;


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
    private isUserProfileVisibale = false;
    private isCreateNavigationPanelVisible = false;
    private isCreateMainDisplayVisible = false;

    public onResourceSelected = new Observable();
    
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

        this.createMainButtons();


        this.initModelSelectionPanel();
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
        this.navigationPanel.isVisible = false;
        this.mainContainer.addControl(this.navigationPanel);
        

        
        // Navigation options definition
        const navOptions = [
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
        dashboardPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        dashboardPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        dashboardPanel.top = "300px";
        dashboardPanel.isVisible = false;
        dashboardPanel.alpha = 0.9; // Slightly transparent
        this.mainContainer.addControl(dashboardPanel);

        this.dashboardPanel = dashboardPanel;
        
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
    this.userProfile.left = "-60px"; // Use left offset instead of right
    this.userProfile.thickness = 1;
    this.userProfile.color = this.SECONDARY_COLOR;
    this.userProfile.cornerRadius = 10;
    this.userProfile.background = this.PANEL_COLOR;
    this.userProfile.alpha = 0.9;
    this.userProfile.isVisible = false
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

    private createMainButtons(): void {


        // private isUserProfileVisibale = false;
        // private isCreateNavigationPanelVisible = false;
        // private isCreateMainDisplayVisible = false;

        const buttonHome = new Rectangle(`home-button-main`);
        buttonHome.width = "30px";
        buttonHome.height = "30px";
        buttonHome.cornerRadius = 5;
        buttonHome.thickness = 2;
        buttonHome.color = this.PANEL_COLOR;
        buttonHome.background = this.BACKGROUND_COLOR;
        buttonHome.top = `65px`;
        buttonHome.left = '10px'
        buttonHome.shadowBlur = 5;
        buttonHome.shadowColor = "black";
        buttonHome.shadowOffsetX = 2;
        buttonHome.shadowOffsetY = 2;
        buttonHome.isPointerBlocker = true;
        buttonHome.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
        buttonHome.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
            
        const buttonHomeText = new TextBlock(`home-button-text-main`);
        buttonHomeText.text = "🏠";
        buttonHomeText.color = this.TEXT_COLOR;
        buttonHomeText.fontSize = 18;
        buttonHomeText.fontStyle = "bold";
        buttonHome.addControl(buttonHomeText);
        
        buttonHome.onPointerEnterObservable.add(() => {
            buttonHome.background = this.PRIMARY_COLOR;
            buttonHome.scaleX = 1.05;
            buttonHome.scaleY = 1.05;
        });
        
        buttonHome.onPointerOutObservable.add(() => {
            buttonHome.background = this.BACKGROUND_COLOR;
            buttonHome.scaleX = 1;
            buttonHome.scaleY = 1;
        });
        
        buttonHome.onPointerUpObservable.add(() => {
            this.dashboardPanel.isVisible = false;
            this.navigationPanel.isVisible = !this.navigationPanel.isVisible; 
        });

            // const buttonNavigation = new Rectangle(`navigation-button-main`);
            // buttonNavigation.width = "30px";
            // buttonNavigation.height = "30px";
            // buttonNavigation.cornerRadius = 50;
            // buttonNavigation.thickness = 0;
            // buttonNavigation.color = this.PANEL_COLOR;
            // buttonNavigation.background = this.BACKGROUND_COLOR;
            // buttonNavigation.top = `70 px`;
            // buttonNavigation.shadowBlur = 5;
            // buttonNavigation.shadowColor = "black";
            // buttonNavigation.shadowOffsetX = 2;
            // buttonNavigation.shadowOffsetY = 2;
            // buttonNavigation.isPointerBlocker = true;
                
            // const buttonNavigationText = new TextBlock(`navigation-button-text-main`);
            // buttonNavigationText.text = config.text;
            // buttonNavigationText.color = this.TEXT_COLOR;
            // buttonNavigationText.fontSize = 18;
            // buttonNavigationText.fontStyle = "bold";
            // buttonNavigation.addControl(buttonNavigationText);
            
            // buttonNavigation.onPointerEnterObservable.add(() => {
            //     buttonNavigation.background = this.PRIMARY_COLOR;
            //     buttonNavigation.scaleX = 1.05;
            //     buttonNavigation.scaleY = 1.05;
            // });
            
            // buttonNavigation.onPointerOutObservable.add(() => {
            //     buttonNavigation.background = this.BACKGROUND_COLOR;
            //     buttonNavigation.scaleX = 1;
            //     buttonNavigation.scaleY = 1;
            // });
            
            // buttonNavigation.onPointerUpObservable.add(() => {
                
            // });


            const buttonDashboard = new Rectangle(`dashboard-button-main`);
            buttonDashboard.width = "30px";
            buttonDashboard.height = "30px";
            buttonDashboard.cornerRadius = 5;
            buttonDashboard.thickness = 2;
            buttonDashboard.color = this.PANEL_COLOR;
            buttonDashboard.background = this.BACKGROUND_COLOR;
            buttonDashboard.top = `100px`;
            buttonDashboard.left = '10px'
            buttonDashboard.shadowBlur = 5;
            buttonDashboard.shadowColor = "black";
            buttonDashboard.shadowOffsetX = 2;
            buttonDashboard.shadowOffsetY = 2;
            buttonDashboard.isPointerBlocker = true;
            buttonDashboard.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
            buttonDashboard.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
                
            const buttonDashboardText = new TextBlock(`dashboard-button-text-main`);
            buttonDashboardText.text = "🏙️";
            buttonDashboardText.color = this.TEXT_COLOR;
            buttonDashboardText.fontSize = 18;
            buttonDashboardText.fontStyle = "bold";
            buttonDashboard.addControl(buttonDashboardText);
            
            buttonDashboard.onPointerEnterObservable.add(() => {
                buttonDashboard.background = this.PRIMARY_COLOR;
                buttonDashboard.scaleX = 1.05;
                buttonDashboard.scaleY = 1.05;
            });
            
            buttonDashboard.onPointerOutObservable.add(() => {
                buttonDashboard.background = this.BACKGROUND_COLOR;
                buttonDashboard.scaleX = 1;
                buttonDashboard.scaleY = 1;
            });
            
            buttonDashboard.onPointerUpObservable.add(() => {
                
                this.navigationPanel.isVisible = false;
                this.dashboardPanel.isVisible = !this.dashboardPanel.isVisible;
            });

            const buttonProfile = new Rectangle(`profile-button-main`);
            buttonProfile.width = "30px";
            buttonProfile.height = "30px";
            buttonProfile.cornerRadius = 5;
            buttonProfile.thickness = 2;
            buttonProfile.color = this.PANEL_COLOR;
            buttonProfile.background = this.BACKGROUND_COLOR;
            buttonProfile.top = `65px`;
            buttonProfile.left = '-20px'
            buttonProfile.shadowBlur = 5;
            buttonProfile.shadowColor = "black";
            buttonProfile.shadowOffsetX = 2;
            buttonProfile.shadowOffsetY = 2;
            buttonProfile.isPointerBlocker = true;
            buttonProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
            buttonProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
            
                
            const buttonProfileText = new TextBlock(`profile-button-text-main`);
            buttonProfileText.text = "ℹ️";
            buttonProfileText.color = this.TEXT_COLOR;
            buttonProfileText.fontSize = 18;
            buttonProfileText.fontStyle = "bold";
            buttonProfile.addControl(buttonProfileText);
            
            buttonProfile.onPointerEnterObservable.add(() => {
                buttonProfile.background = this.PRIMARY_COLOR;
                buttonProfile.scaleX = 1.05;
                buttonProfile.scaleY = 1.05;
            });
            
            buttonProfile.onPointerOutObservable.add(() => {
                buttonProfile.background = this.BACKGROUND_COLOR;
                buttonProfile.scaleX = 1;
                buttonProfile.scaleY = 1;
            });
            
            buttonProfile.onPointerUpObservable.add(() => {
               
                this.isUserProfileVisibale = !this.isUserProfileVisibale;
                this.userProfile.isVisible = this.isUserProfileVisibale;

            });

            this.mainContainer.addControl(buttonDashboard);
            this.mainContainer.addControl(buttonHome);
            this.mainContainer.addControl(buttonProfile);

    }
    
    private createCTAButtons(): void {
        // Create a container rectangle for the CTA buttons
        this.ctaButtons = new Rectangle("ctaButtons");
        this.ctaButtons.width = "32px";
        this.ctaButtons.height = "180px";
        this.ctaButtons.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.ctaButtons.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.ctaButtons.top = "110px";
        this.ctaButtons.left = "-20px"
       //his.ctaButtons.right = "20px";
        this.ctaButtons.thickness = 0;
        this.ctaButtons.cornerRadius = 5;
        this.mainContainer.addControl(this.ctaButtons);
        
        // Create main action buttons
        const buttonConfigs = [
            { text: "🏗️", id: "startBuilding" },
            { text: "📦 ", id: "manageResources" },
            { text: "⬆️ ", id: "upgradeCity" }
        ];
        
        buttonConfigs.forEach((config, index) => {
            const button = new Rectangle(`ctaBtn-${config.id}`);
            button.width = "30px";
            button.height = "30px";
            button.cornerRadius = 5;
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
        actionBar.width = "50%"; // Wider to accommodate scrolling
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

        // Create a ScrollViewer to contain the action buttons
        const actionScroller = new ScrollViewer("actionScroller");
        actionScroller.width = "98%";
        actionScroller.height = "55px";
        actionScroller.thickness = 0;
      //  actionScroller.horizontalBar = 0.5; // Show horizontal scrollbar
        actionScroller.barSize = 10;
        actionScroller.wheelPrecision = 20;
        actionScroller.thumbLength = 0.4;
        actionScroller.thumbHeight = 0.8;
        actionScroller.color = this.BACKGROUND_COLOR;
       // actionScroller.horizontalAlignment = 0.5;
        actionBar.addControl(actionScroller);

        // Add action buttons in a grid with many columns
        const actionGrid = new Grid("actionGrid");
        actionGrid.paddingLeft = "5px";
        actionGrid.paddingRight = "5px";

        const actions = [
            { icon: "🏘️", name: "Residential" },
            { icon: "🏬", name: "Commercial" },
            { icon: "🏭", name: "Industrial" },
            { icon: "🏢", name: "Office" },
            { icon: "💧", name: "Water" },
            { icon: "⚡", name: "Electricity" },
            { icon: "🛣️", name: "Roads" },
            { icon: "🚌", name: "Transport" },
            { icon: "🏥", name: "Healthcare" },
            { icon: "🚒", name: "Fire Dept" },
            { icon: "👮", name: "Police" },
            { icon: "🎓", name: "Education" },
            { icon: "🌳", name: "Parks" },
            { icon: "🏛️", name: "Unique" },
            { icon: "🚗", name: "Vehicles" },
            { icon: "🏮", name: "Props" },
            { icon: "🧹", name: "Clear" },
            { icon: "📊", name: "Stats" },
            { icon: "💰", name: "Treasury" }
        ];

                // Set the grid width based on number of actions (each button is now 30px wide)
        actionGrid.width = `${actions.length * 45}px`;
        actionGrid.height = "45px";

        // Add column definitions dynamically based on the number of actions
        actions.forEach(() => {
            actionGrid.addColumnDefinition(30, true); // Fixed width in pixels for each column (reduced from 100)
        });

        actionScroller.addControl(actionGrid);

        actions.forEach((action, index) => {
            // Create buttons with only the icon
            const actionButton = Button.CreateSimpleButton(`action-${index}`, `${action.icon}`);
            actionButton.width = "30px"; // Reduced from 90px
            actionButton.height = "30px";
            actionButton.color = this.TEXT_COLOR;
            actionButton.cornerRadius = 5;
            actionButton.background = this.BACKGROUND_COLOR;
            actionButton.fontSize = 16; // Slightly larger font for better emoji visibility
            actionButton.thickness = 0;

            // Store the action name as a metadata property for later reference
            actionButton.metadata = { actionName: action.name };

            actionButton.onPointerEnterObservable.add(() => {
                actionButton.background = this.PRIMARY_COLOR;
            });

            actionButton.onPointerOutObservable.add(() => {
                actionButton.background = this.BACKGROUND_COLOR;
            });

            // Add click handling
            actionButton.onPointerClickObservable.add(() => {
                this.handleActionClick(action.name,actions);
            });

            const tooltip = new Rectangle("tooltip");
            tooltip.background = this.BACKGROUND_COLOR;
            tooltip.color = this.CYAN_COLOR;
            tooltip.widthInPixels = 150;
            tooltip.cornerRadius = 10;
            tooltip.heightInPixels = 30;
            tooltip.thickness = 0;
            tooltip.zIndex = 100;
            actionBar.addControl(tooltip);
            const textBlock = new TextBlock("textTooltip", "");
            tooltip.addControl(textBlock);
            tooltip.isVisible = false;

            
            // Show/hide tooltip on hover
            actionButton.onPointerEnterObservable.add(() => {
                tooltip.isVisible = true;
                textBlock.text =action.name

                                // Get button's absolute position
                const buttonX = actionButton._currentMeasure.left;
                const buttonY = actionButton._currentMeasure.top;

                // Get parent’s absolute position (assuming both share same parent)
                const parentX = actionButton.parent?._currentMeasure.left ?? 0;
                const parentY = actionButton.parent?._currentMeasure.top ?? 0;

                // Relative position inside the parent
                const relativeX = buttonX - parentX;
                const relativeY = buttonY - parentY;

                // Apply tooltip offset from the button
                tooltip.left = relativeX < 252 ? (-(relativeX - ( 0.65 * relativeX  ))) - 240 + "px":(-(relativeX - ( 0.65 * relativeX  ))) + 240 + "px" ;
                tooltip.top = (relativeY + 10) + "px";

                console.log(-(relativeX - ( 0.65 * relativeX  )) + "px", relativeX, actionButton.left)
            });

            actionButton.onPointerOutObservable.add(() => {
                tooltip.isVisible = false;
            });

            actionGrid.addControl(actionButton, 0, index);
        });

        this.mainContainer.addControl(actionBar);

        // Store the action bar reference for visibility toggling
        this.actionBar = actionBar;
        this.actionGrid = actionGrid;
    }


        // Add this method to your class to handle action clicks
    private handleActionClick(actionName: string,actions: {
        icon: string;
        name: string;
    }[]): void {
        console.log(`Action clicked: ${actionName}`);
        
        // Reset active button highlighting
        for (let i = 0; i < actions.length; i++) {
            const btn = this.actionGrid.getChildByName(`action-${i}`) as Button;
            if (btn) {
                btn.background = this.BACKGROUND_COLOR;
            }
        }
        
        // Find and highlight the clicked button
        const clickedIndex = actions.findIndex(a => a.name === actionName);
        if (clickedIndex >= 0) {
            const clickedBtn = this.actionGrid.getChildByName(`action-${clickedIndex}`) as Button;
            if (clickedBtn) {
                clickedBtn.background = this.SECONDARY_COLOR;
            }
        }
        
        // Handle specific actions
        switch(actionName) {
            case "Clear":
                //this.activateClearMode();
                break;
            case "Stats":
                //this.showStatsPanel();
                break;
            case "Treasury":
                //this.showTreasuryPanel();
                break;
            default:
                // For building categories
                this.activateBuildingCategory(actionName);
                break;
        }
    }

                    // Update activateBuildingCategory method to show model selection
                private activateBuildingCategory(category: string): void {
                    console.log(`Activating building category: ${category}`);
                    
                    // Reset active button highlighting (assuming this code exists)
                    if (this.activeCategory !== category) {
                        this.activeCategory = category;
                        this.populateModelGrid(category);
                        this.showModelSelectPanel();
                    } else {
                        // If clicking the same category, toggle the panel visibility
                        if (this.modelSelectPanel.isVisible) {
                            this.hideModelSelectPanel();
                            this.activeCategory = null;
                        } else {
                            this.showModelSelectPanel();
                        }
                    }
                }

                        // Initialize the model selection panel
                private initModelSelectionPanel(): void {
                    // Model selection panel (will appear above the action bar when a category is selected)
                    this.modelSelectPanel = new Rectangle("modelSelectPanel");
                    this.modelSelectPanel.width = "50%";
                    this.modelSelectPanel.height = "130px"; 
                    this.modelSelectPanel.cornerRadius = 10;
                    this.modelSelectPanel.color = this.PRIMARY_COLOR;
                    this.modelSelectPanel.thickness = 2;
                    this.modelSelectPanel.background = this.PANEL_COLOR;
                    this.modelSelectPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                    this.modelSelectPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
                    this.modelSelectPanel.top = "-85px"; // Position above the action bar
                    this.modelSelectPanel.alpha = 0.95;
                    this.modelSelectPanel.isVisible = false;
                    
                    // Create a ScrollViewer with horizontal scrolling enabled
                    const modelScroller = new ScrollViewer("modelScroller");
                    modelScroller.width = "100%";
                    modelScroller.height = "110px"; // Reduced height for horizontal layout
                    modelScroller.barSize = 10;
                    modelScroller.wheelPrecision = 20;
                    modelScroller.thumbLength = 0.4;
                    modelScroller.thumbHeight = 0.8;
                    modelScroller.color =this.BACKGROUND_COLOR;
                    modelScroller.background = this.BACKGROUND_COLOR;
                    modelScroller.thickness = 0;
                    modelScroller.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                    modelScroller.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                    
                    // Configure scroll viewer for horizontal scrolling
                    // modelScroller.horizontalScrollBarVisibility = ScrollViewer.HORIZONTAL_SCROLLBAR_VISIBLE;
                    // modelScroller.verticalScrollBarVisibility = ScrollViewer.VERTICAL_SCROLLBAR_HIDDEN;
                    
                    this.modelSelectPanel.addControl(modelScroller);
                    
                    // Create StackPanel for model options instead of Grid
                    this.modelContainer = new StackPanel("modelStackPanel");
                    this.modelContainer.isVertical = false; // Horizontal layout
                    this.modelContainer.width = "100%"; // Will be adjusted when populated
                    this.modelContainer.height = "100px";
                    this.modelContainer.spacing = 10; // Add space between models
                    this.modelContainer.paddingLeft = "10px";
                    this.modelContainer.paddingRight = "10px";
                    this.modelContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                    this.modelContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                    
                    // Add StackPanel to ScrollViewer
                    modelScroller.addControl(this.modelContainer);
                    this.mainContainer.addControl(this.modelSelectPanel);
                    
                    // Add a "close" button to hide the model panel
                    const closeButton = Button.CreateSimpleButton("closeModelPanel", "✕");
                    closeButton.width = "20px";
                    closeButton.height = "20px";
                    closeButton.color = this.TEXT_COLOR;
                    closeButton.cornerRadius = 15;
                    closeButton.background = this.PRIMARY_COLOR;
                    closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
                    closeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                    closeButton.thickness = 0;
                    closeButton.top = "5px";
                    closeButton.onPointerClickObservable.add(() => {
                        this.hideModelSelectPanel();
                    });
                    this.modelSelectPanel.addControl(closeButton);
                }

                // Populate models using StackPanel instead of Grid
                private populateModelGrid(category: string): void {
                    console.log(`Populating models for category: ${category}`);
                    
                    // Clear existing models
                    this.modelContainer.clearControls();
                    
                    // Get models for the selected category
                    const models = modelCategories[category] || [];
                    
                    if (models.length === 0) {
                        console.log("No models found in category:", category);
                        return;
                    }
                    
                    console.log(`Found ${models.length} models in category: ${category}`);
                    
                    // Set width based on number of models (each 100px wide + 10px spacing)
                    const totalWidth = models.length * 110; // 100px per model + 10px spacing
                    this.modelContainer.width = `${totalWidth}px`;
                    
                    // Add each model to the stack panel
                    models.forEach((modelFile, index) => {
                        // Get model name without extension
                        const modelName = this.getModelNameWithoutExtension(modelFile);
                        
                        // Create model container
                        const modelContainer = new Rectangle(`model-${index}-container`);
                        modelContainer.width = "100px";
                        modelContainer.height = "100px";
                        modelContainer.thickness = 0;
                        modelContainer.cornerRadius = 8;
                        modelContainer.background = this.BACKGROUND_COLOR;
                        
                        // Create model image
                        const modelImage = new Image(`model-${index}-image`, `/images/${modelName}.png`);
                        modelImage.width = "80px";
                        modelImage.height = "80px";
                        modelImage.stretch = Image.STRETCH_UNIFORM;
                        modelImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                        modelImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                        modelContainer.addControl(modelImage);
                        
                        // Create tooltip for model name
                        const modelTooltip = new TextBlock(`model-${index}-tooltip`, modelName);
                        modelTooltip.color = this.TEXT_COLOR;
                        modelTooltip.fontSize = 12;
                        modelTooltip.height = "20px";
                        modelTooltip.paddingTop = "2px";
                        modelTooltip.paddingBottom = "2px";
                        modelTooltip.paddingLeft = "4px";
                        modelTooltip.paddingRight = "4px";
                        //modelTooltip.background = "#000000AA";
                        //modelTooltip.cornerRadius = 3;
                        modelTooltip.isVisible = false;
                        this.mainContainer.addControl(modelTooltip);
                        
                        // Show/hide tooltip on hover
                        modelContainer.onPointerEnterObservable.add(() => {
                            modelTooltip.isVisible = true;
                            
                            // Position tooltip above the model container
                            const containerRect = modelContainer._currentMeasure;
                            modelTooltip.leftInPixels = containerRect.left + containerRect.width/2;
                            modelTooltip.topInPixels = containerRect.top - 25;
                            
                            modelTooltip.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                            modelTooltip.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                            
                            // Highlight on hover
                            modelContainer.color = this.PRIMARY_COLOR;
                            modelContainer.thickness = 2;
                            modelContainer.background = this.BACKGROUND_COLOR;
                        });
                        
                        modelContainer.onPointerOutObservable.add(() => {
                            modelTooltip.isVisible = false;
                            
                            // Reset highlighting
                            modelContainer.color = "transparent";
                            modelContainer.thickness = 0;
                            modelContainer.background = this.BACKGROUND_COLOR;
                        });
                        
                        // Handle model selection
                        modelContainer.onPointerClickObservable.add(() => {
                            this.selectModel(modelFile, category);
                            console.log(`Selected model: ${modelName}`);
                        });
                        
                        // Add model container to the stack panel
                        this.modelContainer.addControl(modelContainer);
                        console.log(`Added model ${modelName} to stack panel`);
                    });
                    
                    // Force update
                    this.modelContainer._markAsDirty();
                    
                    console.log(`Stack panel populated with ${models.length} models`);
                }

        // Helper function to get model name without extension
        private getModelNameWithoutExtension(filename: string): string {
            return filename.replace('.glb', '');
        }

        // Select a model - implement the functionality to place or use the selected model
        private selectModel(modelFile: string, category: string): void {
            console.log(`Selected model: ${modelFile} from category: ${category}`);
            // Implement model selection functionality here
            // This could place the model in the scene, prepare it for placement, etc.

            this.selectedResource = {
                model: modelFile,
                category: category
            }
            
            // Optionally hide the panel after selection
            this.hideModelSelectPanel();
            this.enableBuildingPlacementMode();
        }

        // Show model selection panel
        private showModelSelectPanel(): void {
            this.modelSelectPanel.isVisible = true;
        }

        // Hide model selection panel
        private hideModelSelectPanel(): void {
            this.modelSelectPanel.isVisible = false;
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


    public getSelectedResource(): {
        model: string,
        category: string
    } | null {

        if (this.selectedResource) {
            this.onResourceSelected.notifyObservers(this.selectedResource);
          }

        return this.selectedResource
    }

    public resetSelectedResource() : void {
        this.selectedResource = null;
    }
    
    // Method to enable building placement mode
    private enableBuildingPlacementMode(): void {
        // This method would handle the logic for placing the selected building on the map
        // For example, creating a ghost building that follows the mouse
        // and allowing the user to click to place it
        
        if (this.selectedResource){
            //console.log(`Building placement mode enabled for: ${this.selectedBuilding?.name}`);

            const name = this.getName(this.selectedResource.model);
        
            // Show a notification or change cursor to indicate building placement mode
            const notification = new TextBlock("placementNotification");
            notification.text = `Click on the map to place ${name}`;
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
        }
        
        // In a real implementation, you would set up event listeners for the 3D scene
        // to handle the actual building placement
    }

        private getName(filename: string): string {
            return filename
            .replace(/\.[^/.]+$/, '')          // Remove extension
            .split('-')                        // Split by dash
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize
            .join(' ');                        // Join with spaces
        }
      
    
    // Handle navigation clicks
    private handleNavigation(destination: string): void {
        console.log(`Navigating to: ${destination}`);
        
        switch(destination) {
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
                this.switchToCityBuilding();
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


    /**
 * Shows a toast notification with the specified message and type
 * @param message The message to display
 * @param type The type of toast (impacts styling)
 * @param duration Duration in milliseconds (default: 3000ms)
 */
public showToast(message: string, type: ToastType = ToastType.INFO, duration: number = 3000): void {
    // Create toast container
    const toast = new Rectangle("toast");
    toast.width = "280px";
    toast.height = "auto"; // Auto height based on content
    toast.cornerRadius = 8;
    toast.thickness = 0;
    toast.paddingTop = "12px";
    toast.paddingBottom = "12px";
    toast.paddingLeft = "15px";
    toast.paddingRight = "15px";
    toast.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    toast.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    toast.top = "20px"; // Distance from top
    toast.zIndex = 999; // Ensure it's on top of other UI elements
    
    // Set styles based on toast type
    switch (type) {
        case ToastType.SUCCESS:
            toast.background = "#4CAF50"; // Green
            break;
        case ToastType.WARNING:
            toast.background = "#FF9800"; // Orange
            break;
        case ToastType.ERROR:
            toast.background = "#F44336"; // Red
            break;
        case ToastType.INFO:
        default:
            toast.background = "#2196F3"; // Blue
            break;
    }
    
    // Create text container
    const textBlock = new TextBlock("toastText", message);
    textBlock.color = "white";
    textBlock.fontSize = 14;
    textBlock.textWrapping = true;
    textBlock.resizeToFit = true;
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.width = "100%";
    toast.addControl(textBlock);
    
    // Add to main container
    this.mainContainer.addControl(toast);
    
    // Animation for fade-in
    toast.alpha = 0;
    let fadeInAnimation = 0;
    const fadeInInterval = setInterval(() => {
        fadeInAnimation += 0.1;
        toast.alpha = fadeInAnimation;
        if (fadeInAnimation >= 1) {
            clearInterval(fadeInInterval);
        }
    }, 20);
    
    // Remove toast after duration
    setTimeout(() => {
        // Animation for fade-out
        let fadeOutAnimation = 1;
        const fadeOutInterval = setInterval(() => {
            fadeOutAnimation -= 0.1;
            toast.alpha = fadeOutAnimation;
            if (fadeOutAnimation <= 0) {
                clearInterval(fadeOutInterval);
                this.mainContainer.removeControl(toast);
            }
        }, 20);
    }, duration);
}
    
    // Switch to City Building view
    private switchToCityBuilding(): void {
        this.actionBar.isVisible = !this.actionBar.isVisible;

        if (!this.actionBar.isVisible){
            this.resetSelectedResource();
        }
    }
    
    // Switch to Resources view
    private switchToResourcesView(): void {
        
    }
    
    // Public method to dispose UI
    public dispose(): void {
        this.advancedTexture.dispose();
    }
}