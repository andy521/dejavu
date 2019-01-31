// @flow

import React, { Component, createRef } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { connect } from 'react-redux';
import { Skeleton, Icon } from 'antd';
import { mediaMin } from '@divyanshu013/media';
import { AutoSizer } from 'react-virtualized';

import Flex from '../Flex';
import Actions from './Actions';
import AddRowModal from './AddRowModal';
import AddFieldModal from './AddFieldModal';
import DataTableHeader from '../DataTable/DataTableHeader';
import NestedColumnToggle from './NestedColumnToggle';
import GlobalSearch from './GlobalSearch';
import ResultList from './ResultSet';
import CloneApp from './CloneApp';

import { fetchMappings } from '../../actions';
import { getUrl, getHeaders } from '../../reducers/app';
import * as dataSelectors from '../../reducers/data';
import {
	getIsLoading,
	getMappings,
	getIndexes,
	getTypes,
} from '../../reducers/mappings';
import { parseUrl, convertArrayToHeaders, getUrlParams } from '../../utils';
import colors from '../theme/colors';
import PromotedResultsContainer from './PromotedResultsContainer';
import PromotedResults from './PromotedResults';
import HiddenResults from './HiddenResults';

type Props = {
	url: string,
	fetchMappings: () => void,
	isLoading: boolean,
	mappings: any,
	isDataLoading: boolean,
	indexes: string[],
	types: string[],
	headers: any[],
	searchTerm: string,
};

class DataBrowser extends Component<Props> {
	headerRef = createRef();

	promotedHeaderRef = createRef();

	componentDidMount() {
		this.props.fetchMappings();
	}

	handleReload = () => {
		this.props.fetchMappings();
	};

	render() {
		const {
			url: rawUrl,
			isLoading,
			mappings,
			isDataLoading,
			indexes,
			headers,
			searchTerm,
		} = this.props;
		const { credentials, url } = parseUrl(rawUrl);
		let baseProps = { url, app: indexes.join(',') };

		if (credentials) {
			baseProps = { ...baseProps, credentials };
		}
		const customHeaders = headers.filter(
			item => item.key.trim() && item.value.trim(),
		);

		if (customHeaders.length) {
			baseProps = {
				...baseProps,
				headers: convertArrayToHeaders(headers),
			};
		}

		const { appswitcher, showActions } = getUrlParams(
			window.location.search,
		);
		const hideAppSwitcher = appswitcher && appswitcher === 'false';
		let areActionsVisisble = true;

		if (showActions && showActions === 'false') {
			areActionsVisisble = false;
		}
		return (
			<Skeleton loading={isLoading} active>
				{!isLoading && !isDataLoading && mappings && (
					<div css={{ position: 'relative' }}>
						<ReactiveBase {...baseProps}>
							<div>
								<Actions onReload={this.handleReload} />
								<NestedColumnToggle />
								<GlobalSearch searchTerm={searchTerm} />
							</div>
							<PromotedResultsContainer>
								<h3 css={{ fontSize: 15, margin: 0 }}>
									<Icon type="star" theme="filled" /> Promoted
									Results
								</h3>
								<PromotedResults />
								<div
									id="result-list"
									css={{
										marginTop: '20px',
										border: `1px solid ${
											colors.tableBorderColor
										}`,
										borderRadius: 3,
										width: '100%',
										position: 'relative',
										height:
											window.innerHeight -
											(hideAppSwitcher ? 250 : 350),
										overflow: 'visible',
									}}
								>
									<AutoSizer
										css={{
											height: '100% !important',
											width: '100% !important',
										}}
									>
										{({ height, width }) => (
											<>
												<DataTableHeader
													ref={this.headerRef}
												/>
												<ResultList
													height={height}
													width={width}
													headerRef={this.headerRef}
												/>
											</>
										)}
									</AutoSizer>
								</div>
								<HiddenResults />
							</PromotedResultsContainer>
						</ReactiveBase>
					</div>
				)}
				{mappings && (
					<Flex
						css={{
							marginTop: 100,
							[mediaMin.medium]: {
								marginTop: 10,
							},
							paddingBottom: !areActionsVisisble ? '30px' : 0,
						}}
						wrap="no-wrap"
						alignItems="center"
					>
						<CloneApp />
						{areActionsVisisble && <AddRowModal />}
						{areActionsVisisble && <AddFieldModal />}
					</Flex>
				)}
			</Skeleton>
		);
	}
}

const mapStateToProps = state => ({
	url: getUrl(state),
	isLoading: getIsLoading(state),
	mappings: getMappings(state),
	isDataLoading: dataSelectors.getIsLoading(state),
	indexes: getIndexes(state),
	types: getTypes(state),
	headers: getHeaders(state),
});

const mapDispatchToProps = {
	fetchMappings,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DataBrowser);