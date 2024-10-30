import { useBlockProps } from '@wordpress/block-editor';
import { SandBox, Snackbar } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import useSharedWidgets from '../../hooks/useSharedWidgets';
import usePrivateWidgets from '../../hooks/usePrivateWidgets';
import useExcelkitsCredentials from '../../hooks/useExcelkitsCredentials';
import Controls from './Controls';
import SelectWidgets from './SelectWidget';
import settings from './settings';
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @param  {any}       attributes
 * @param  {Function}  setAttributes
 * @param  {boolean}   isSelected
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes, isSelected }) {
	const { snippetHtml, isBlockInsertPreview, apiKey, secret } = attributes;
	const {
		hasCredentials,
		hasLoaded: areCredentialsLoaded,
		error: errCredentials,
		createAuthorization,
	} = useExcelkitsCredentials({ apiKey, secret });
	const {
		data: sharedWidgets,
		selectOptions: sharedWidgetOptions,
		download: downloadSharedWidgets,
		isLoading: areSharedWidgetsLoading,
		error: errSharedWidgets,
	} = useSharedWidgets({
		canLoad: Boolean(areCredentialsLoaded && !hasCredentials),
	});
	const {
		data: privateWidgets,
		selectOptions: privateWidgetOptions,
		download: downloadPrivateWidgets,
		isLoading: arePrivateWidgetsLoading,
		error: errPrivateWidgets,
	} = usePrivateWidgets({
		canLoad: Boolean(areCredentialsLoaded && hasCredentials && isSelected),
		getAuthorization: createAuthorization,
	});

	// State variables
	const showSharedWidgets = areCredentialsLoaded && !hasCredentials;
	const showPrivateWidgets = areCredentialsLoaded && hasCredentials;
	const isLoadingSharedWidgets =
		showSharedWidgets && !errSharedWidgets && areSharedWidgetsLoading;
	const isLoadingPrivateWidgets =
		showPrivateWidgets && !errPrivateWidgets && arePrivateWidgetsLoading;
	const isLoading =
		!areCredentialsLoaded ||
		isLoadingSharedWidgets ||
		isLoadingPrivateWidgets;

	// Widget Queuing and Selection
	const [selectedWidgetId, setSelectedWidgetId] = useState('');
	const queueSelectWidget = (widgetId) => setSelectedWidgetId(widgetId);

	// Error message to render in snackbar
	const errorMessage = useMemo(() => {
		if (errCredentials) {
			return settings.errors.credentials;
		} else if (errSharedWidgets) {
			return settings.errors.sharedWidgetsDownload;
		} else if (errPrivateWidgets) {
			return settings.errors.privateWidgetsDownload;
		}

		return '';
	}, [errCredentials, errSharedWidgets, errPrivateWidgets]);

	// Set and save the selected widget's
	// Identifier and its' snippet HTML
	const selectWidget = (widgetId, widgets) => {
		const selectedWidget = widgets.find(({ id }) => id === widgetId);

		if (selectedWidget) {
			setAttributes({
				selected: widgetId,
				snippetHtml: decodeURIComponent(selectedWidget.snippetHtml),
			});
		}
	};

	return (
		<div {...useBlockProps()}>
			<>
				{/* Show preview image */}
				<BlockPreview isVisible={isBlockInsertPreview} />

				{/* Show widget select */}
				{!isBlockInsertPreview ? (
					<>
						<Controls isPreview={Boolean(snippetHtml)} />

						{snippetHtml ? (
							<SandBox html={snippetHtml} />
						) : (
							<>
								<ErrorNotifications message={errorMessage} />
								<SelectWidgets
									selected={selectedWidgetId}
									isLoading={isLoading}
									instructions={
										showSharedWidgets
											? settings.instructions.free
											: settings.instructions.auth
									}
									options={
										showSharedWidgets
											? sharedWidgetOptions
											: privateWidgetOptions
									}
									hasError={Boolean(
										errSharedWidgets || errPrivateWidgets
									)}
									reload={
										showSharedWidgets
											? downloadSharedWidgets
											: downloadPrivateWidgets
									}
									onChange={queueSelectWidget}
									onSelect={() =>
										selectWidget(
											selectedWidgetId,
											showSharedWidgets
												? sharedWidgets
												: privateWidgets
										)
									}
								/>
							</>
						)}
					</>
				) : (
					<></>
				)}
			</>
		</div>
	);
}

const ErrorNotifications = ({ message = '', onRemove = () => null }) =>
	message ? (
		<Snackbar
			status="error"
			className="components-snackbar exk-error-message-notification"
			icon={
				<span aria-label="Icon" role="img" style={{ fontSize: 21 }}>
					⚠️
				</span>
			}
			onRemove={onRemove}
		>
			{message}
		</Snackbar>
	) : (
		<></>
	);

const BlockPreview = ({ isVisible }) =>
	isVisible ? (
		<img
			className="exk-block-insert-preview"
			src="https://excelkits.com/img/wordpress-plugins/calculator-blocks/preview.webp"
			alt="Calculator widget rendered"
		/>
	) : (
		<></>
	);
