/// <reference types="@rbxts/types/plugin"/>

// TODO: Make it automatically add to `default.project.json` files
// TODO: Make it customizable what name the single-file Rojoesque generator should go to

import { PLUGIN_NAME, OPTIONS, ICON_ID, DEFAULT_SETTING, IO_SERVE_URL, PLUGIN_DESCRIPTION } from "config";
import Radio from "radio";
import generateOptions from "generateTree";
import Feedback from "feedback";
import { delay } from "@rbxts/delay-spawn-wait";

const HttpService = game.GetService("HttpService");
const RunService = game.GetService("RunService");
const Selection = game.GetService("Selection");

let isAutoActive = false

delay(1, () => {
	const widgetSize = new Vector2(227, 232); // new Vector2(224, 248);
	const DockWidget = plugin.CreateDockWidgetPluginGui(
		PLUGIN_NAME,
		new DockWidgetPluginGuiInfo(
			Enum.InitialDockState.Right,
			false,
			false,
			widgetSize.X,
			widgetSize.Y,
			widgetSize.X,
			widgetSize.Y,
		),
	);
	DockWidget.Title = DockWidget.Name = "rbxts-object-to-tree";
	delay(0, () => (DockWidget.Enabled = false));

	const Background = new Instance("Frame");
	Background.AnchorPoint = new Vector2(0.5, 0);
	Background.BackgroundColor3 = Color3.fromRGB(255, 255, 255);
	Background.BorderColor3 = Color3.fromRGB(221, 221, 221);
	Background.Name = "Background";
	Background.Position = new UDim2(0.5, 0, 0, 1);
	Background.Size = new UDim2(1, 0, 1, 0);
	Background.ZIndex = -1;

	const BackImage = new Instance("ImageLabel");
	BackImage.AnchorPoint = new Vector2(0.5, 0.5);
	BackImage.BackgroundTransparency = 1;
	BackImage.Image = "rbxassetid://3561078226";
	BackImage.ImageTransparency = 0.88;
	BackImage.Name = "BackImage";
	BackImage.Position = new UDim2(0.5, 0, 0.5, 0);
	BackImage.Size = new UDim2(0, 135, 0, 135); // new UDim2(0, 270, 0, 270);
	BackImage.ZIndex = 0;
	BackImage.Parent = Background;

	const Indicator = new Instance("Frame");
	Indicator.BackgroundColor3 = Color3.fromRGB(4, 255, 0);
	Indicator.BorderSizePixel = 0;
	Indicator.Name = "Indicator";
	Indicator.Position = new UDim2(0, -1, 1, 2);
	Indicator.Size = new UDim2(1, 2, 0, 4);
	Indicator.Visible = false;

	const Choices = new Instance("Frame");
	Choices.BackgroundTransparency = 1;
	Choices.Name = "Choices";
	Choices.Position = new UDim2(0, 0, 0, 0);
	Choices.Size = new UDim2(1, 0, 1, 0);
	Choices.ZIndex = 10;

	const Instructions = new Instance("TextLabel");
	Instructions.BackgroundTransparency = 1;
	Instructions.Font = Enum.Font.SourceSans;
	Instructions.LayoutOrder = -1;
	Instructions.Name = "Instructions";
	Instructions.Text = "  Export type:";
	Instructions.TextColor3 = Color3.fromRGB(0, 0, 0);
	Instructions.TextSize = 18;
	Instructions.TextTransparency = 0.13;
	Instructions.TextWrapped = true;
	Instructions.TextXAlignment = Enum.TextXAlignment.Left;
	Instructions.TextYAlignment = Enum.TextYAlignment.Center;
	Instructions.Size = new UDim2(-8, 1, 18, 0);
	Instructions.ZIndex = 2;
	Instructions.Parent = Choices;

	const BottomHint = new Instance("TextLabel");
	BottomHint.TextSize = 11;
	BottomHint.BackgroundTransparency = 1;
	BottomHint.Font = Enum.Font.SourceSansSemibold;
	BottomHint.LayoutOrder = 10;
	BottomHint.Name = "BottomHint";
	BottomHint.Size = new UDim2(-8, 1, 36, 0);
	BottomHint.Text = "Run `npx io-serve` with HTTP requests enabled to automatically place files in your project.";
	BottomHint.TextColor3 = Color3.fromRGB(0, 0, 0);
	BottomHint.TextSize = 11;
	BottomHint.TextTransparency = 0.46;
	BottomHint.TextWrapped = true;
	// BottomHint.TextYAlignment = Enum.TextYAlignment.Bottom;
	BottomHint.ZIndex = 2;
	BottomHint.Parent = Choices;

	const UIGridLayout = new Instance("UIGridLayout");
	UIGridLayout.CellPadding = new UDim2(0, 0, 0, 0);
	UIGridLayout.CellSize = new UDim2(1, 0, 0, 32);
	UIGridLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	UIGridLayout.FillDirection = Enum.FillDirection.Vertical;
	UIGridLayout.VerticalAlignment = Enum.VerticalAlignment.Top;

	const GeneratorFrame = new Instance("Frame");
	GeneratorFrame.BackgroundTransparency = 1;
	GeneratorFrame.Name = "GenerateButton";
	GeneratorFrame.Size = new UDim2(0, 200, 0, 50);
	GeneratorFrame.Parent = Choices;

	const ImageLabel = new Instance("ImageLabel");
	ImageLabel.AnchorPoint = new Vector2(0.5, 0.5);
	ImageLabel.BackgroundTransparency = 1;
	ImageLabel.Image = "rbxassetid://1934624205";
	ImageLabel.ImageColor3 = Color3.fromRGB(226, 36, 26);
	ImageLabel.Position = new UDim2(0.5, 0, 0.5, 0);
	ImageLabel.ScaleType = Enum.ScaleType.Slice;
	ImageLabel.Size = new UDim2(0.5, 0, 1, -4);
	ImageLabel.SliceCenter = new Rect(8, 8, 248, 248);
	ImageLabel.Parent = GeneratorFrame;

	const GenerateButton = new Instance("TextButton");
	GenerateButton.BackgroundTransparency = 1;
	GenerateButton.Font = Enum.Font.SourceSansBold;
	GenerateButton.Size = new UDim2(1, 0, 1, 0);
	GenerateButton.Text = "GENERATE";
	GenerateButton.TextColor3 = Color3.fromRGB(255, 255, 255);
	GenerateButton.TextSize = 20;
	GenerateButton.Parent = GeneratorFrame;

	const AutoButton = new Instance("TextButton");
	AutoButton.BorderSizePixel = 0;
	AutoButton.BackgroundTransparency = 0;
	AutoButton.BackgroundColor3 = Color3.fromRGB(226, 36, 26);
	AutoButton.Font = Enum.Font.SourceSansBold;
	AutoButton.Size = new UDim2(.5, 0, 0, 20);
	AutoButton.AnchorPoint = new Vector2(.5, 0)
	AutoButton.Position = new UDim2(.5, 0, 0, 230);
	AutoButton.Text = "Auto Export";
	AutoButton.TextColor3 = Color3.fromRGB(255, 255, 255);
	AutoButton.TextSize = 20;
	AutoButton.Parent = Background;

	const UICorner = new Instance( "UICorner" )
	UICorner.Parent = AutoButton
	UICorner.CornerRadius = new UDim(.1)

	const options = new Map<OPTIONS, Radio>();

	function makeOption(option: OPTIONS, order: number) {
		const FullButton = new Instance("TextButton");
		FullButton.BackgroundTransparency = 1;
		FullButton.Font = Enum.Font.SourceSans;
		FullButton.Name = option;
		FullButton.Size = new UDim2(0, 200, 0, 50);
		FullButton.Text = "";
		FullButton.TextColor3 = Color3.fromRGB(0, 0, 0);
		FullButton.TextSize = 14;
		FullButton.LayoutOrder = order;
		FullButton.Parent = Choices;

		const GenerateType = new Instance("TextLabel");
		GenerateType.BackgroundTransparency = 1;
		GenerateType.Font = Enum.Font.SourceSans;
		GenerateType.LayoutOrder = 1;
		GenerateType.Name = option;
		GenerateType.Position = new UDim2(0, 48, 0, 0);
		GenerateType.Size = new UDim2(1, -GenerateType.Position.X.Offset, 1, 0);
		GenerateType.Text = option;
		GenerateType.TextColor3 = Color3.fromRGB(0, 0, 0);
		GenerateType.TextSize = 18;
		GenerateType.TextTransparency = 0.13;
		GenerateType.TextXAlignment = Enum.TextXAlignment.Left;
		GenerateType.ZIndex = 11;
		GenerateType.Parent = FullButton;

		const checkbox = new Radio({
			anchorPoint: new Vector2(0, 0.5),
			position: new UDim2(0, 16, 0.5, 0),
			size: 24,
			parent: FullButton,
			borderRadius: 16,
			isChecked: false,

			onChecked: (isChecked) => {
				if (isChecked) {
					plugin.SetSetting(DEFAULT_SETTING, option);

					for (const [opt, check] of options) {
						if (opt !== option && check.getChecked()) {
							check.setChecked(false);
						}
					}
				}
			},
		});

		FullButton.MouseButton1Click.Connect(() => {
			if (!checkbox.getChecked()) checkbox.setChecked(true);
		});
		options.set(option, checkbox);
	}

	OPTIONS.forEach(makeOption);
	options.get(DEFAULT_SETTING)!.setChecked(true);
	GeneratorFrame.LayoutOrder = OPTIONS.size();

	function getSelectedOption() {
		for (const [option, check] of options) {
			if (check.getChecked()) return option;
		}
		return DEFAULT_SETTING;
	}

	function toggleSettings() {
		DockWidget.Enabled = !DockWidget.Enabled;
	}

	/** tests to see if io-serve is available */
	function isIoServeAvailable() {
		const result = pcall(() => HttpService.RequestAsync({ Url: IO_SERVE_URL, Method: "HEAD" }));
		return result[0] && result[1].StatusCode === 200;
	}

	function getServices () {
		const workspace = game.GetService("Workspace")
		const lighting = game.GetService("Lighting")
		const replicatedFirst = game.GetService("ReplicatedFirst")
		const replicatedStorage = game.GetService("ReplicatedStorage")
		const serverScriptService = game.GetService("ServerScriptService")
		const serverStorage = game.GetService("ServerStorage")
		const starterGui = game.GetService("StarterGui")
		const starterPack = game.GetService("StarterPack")
		return [workspace, lighting, replicatedFirst, replicatedStorage, serverScriptService, serverStorage, starterGui, starterPack]
	}

	let generating = false;

	// TODO: Function still runs while testing game, but IsEdit always returns true
	function generate () {
		if (!generating ) {
			generating = true;
			const selection = isAutoActive ? getServices()  : Selection.Get()
			const selectionSize = selection.size();

			if (0 < selectionSize) {
				const useIoServe = isIoServeAvailable();
				let success = true;

				for (const selected of selection) {
					try {
						if (!generateOptions.get(getSelectedOption())!(selected, useIoServe)) {
							success = false;
						}
					} catch (e) {
						new Feedback(tostring(e));
						break;
					}
				}

				if (success && selectionSize !== 1 && !isAutoActive) {
					new Feedback(
						useIoServe ? "Sent multiple files to io-serve" : "Generated multiple files in Lighting!",
					);
				}
			} else {
				if (!isAutoActive) new Feedback(`Please select something to generate.`);
			}
			generating = false;
		}
	}

	GenerateButton.MouseButton1Click.Connect(() => generate());
	AutoButton.MouseButton1Click.Connect( () => {
		isAutoActive = !isAutoActive
		AutoButton.BackgroundColor3 = isAutoActive ? Color3.fromRGB(43, 227, 26) : Color3.fromRGB(226, 36, 26);
	})

	task.spawn( () => {
		while ( true ) {
			if (isAutoActive) generate()
			task.wait(1)
		}
	})

	Choices.Parent = Background;
	UIGridLayout.Parent = Choices;
	Indicator.Parent = Background;
	Background.Parent = DockWidget;

	plugin
		.CreateToolbar(PLUGIN_NAME)
		.CreateButton(PLUGIN_NAME, PLUGIN_DESCRIPTION, `rbxassetid://${ICON_ID}`)
		.Click.Connect(toggleSettings);
});
