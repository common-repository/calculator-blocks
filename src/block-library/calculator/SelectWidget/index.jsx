import { __ } from '@wordpress/i18n';
import {
	Button,
	Placeholder,
	SelectControl,
	Spinner,
} from '@wordpress/components';
import { BlockIcon } from '@wordpress/block-editor';
import './styles.scss';

const SelectWidget = ({
	selected = '',
	options = [],
	instructions: srcInstructions,
	isLoading = false,
	hasError = false,
	reload = () => null,
	onChange = () => null,
	onSelect = () => null,
}) => {
	const title = __('Excelkits Calculator', 'excelkits-blocks');
	// eslint-disable-next-line @wordpress/i18n-no-variables
	const instructionsTxt = __(`${srcInstructions}`, 'excelkits-blocks');
	const tryAgainTxt = __('Try again', 'excelkits-blocks');
	const selectWidgetTxt = __('Select widget', 'excelkits-blocks');
	const selectTxt = __('Select', 'excelkits-blocks');
	const noWidgetsTxt = __('No widgets available', 'excelkits-blocks');
	const refreshTxt = __('Refresh', 'excelkits-blocks');

	return (
		<Placeholder
			icon={<BlockIcon icon="calculator" />}
			className="exk-select-widget-calc"
			label={title}
			withIllustration={true}
			instructions={instructionsTxt}
		>
			{hasError ? (
				<Button variant="primary" onClick={reload} text={tryAgainTxt} />
			) : (
				<></>
			)}

			{!hasError && isLoading ? (
				<Spinner
					style={{ width: '26px', height: '26px' }}
					className="exk-select-widget-calc-spinner"
				/>
			) : (
				<></>
			)}

			{/* Empty State: Assumes account authenticated and API Keys set */}
			{!hasError && !isLoading && !options.length ? (
				<span className={'exk-select-widget-calc-empty'}>
					{noWidgetsTxt}{' '}
					<a
						className="exk-select-widget-calc-link"
						href="https://excelkits.com/widgets"
						rel="noreferrer"
						target="_blank"
					>
						Create First Widget
					</a>
					.
				</span>
			) : (
				<></>
			)}

			{!hasError && !isLoading && Boolean(options.length) ? (
				<>
					<SelectControl
						className="exk-select-widget-calc-control"
						onChange={onChange}
						placeholder={selectWidgetTxt}
					>
						<option disabled selected value>
							Select widget
						</option>
						{options.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</SelectControl>

					{selected ? (
						<Button
							className="exk-select-widget-calc-button"
							onClick={onSelect}
							variant="primary"
							text={selectTxt}
						/>
					) : (
						<></>
					)}

					<Button
						className="exk-select-widget-calc-button--alternative"
						onClick={reload}
						text={refreshTxt}
					/>
				</>
			) : (
				<></>
			)}
		</Placeholder>
	);
};

export default SelectWidget;
