import { CurrentRateService } from '@ghostfolio/api/app/portfolio/current-rate.service';
import { ExchangeRateDataService } from '@ghostfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { parseDate } from '@ghostfolio/common/helper';

import Big from 'big.js';

import { CurrentRateServiceMock } from './current-rate.service.mock';
import { PortfolioCalculator } from './portfolio-calculator';

jest.mock('@ghostfolio/api/app/portfolio/current-rate.service', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CurrentRateService: jest.fn().mockImplementation(() => {
      return CurrentRateServiceMock;
    })
  };
});

describe('PortfolioCalculator', () => {
  let currentRateService: CurrentRateService;
  let exchangeRateDataService: ExchangeRateDataService;

  beforeEach(() => {
    currentRateService = new CurrentRateService(null, null, null);

    exchangeRateDataService = new ExchangeRateDataService(
      null,
      null,
      null,
      null
    );
  });

  describe('get current positions', () => {
    it.only('with BALN.SW buy', async () => {
      const portfolioCalculator = new PortfolioCalculator({
        currentRateService,
        exchangeRateDataService,
        currency: 'CHF',
        orders: [
          {
            currency: 'CHF',
            date: '2021-11-30',
            dataSource: 'YAHOO',
            fee: new Big(1.55),
            name: 'Bâloise Holding AG',
            quantity: new Big(2),
            symbol: 'BALN.SW',
            type: 'BUY',
            unitPrice: new Big(136.6)
          }
        ]
      });

      portfolioCalculator.computeTransactionPoints();

      const spy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => parseDate('2021-12-18').getTime());

      const chartData = await portfolioCalculator.getChartData({
        start: parseDate('2021-11-30')
      });

      const currentPositions = await portfolioCalculator.getCurrentPositions(
        parseDate('2021-11-30')
      );

      const investments = portfolioCalculator.getInvestments();

      const investmentsByMonth = portfolioCalculator.getInvestmentsByGroup({
        data: chartData,
        groupBy: 'month'
      });

      spy.mockRestore();

      expect(currentPositions).toEqual({
        currentValue: new Big('297.8'),
        errors: [],
        grossPerformance: new Big('24.6'),
        grossPerformancePercentage: new Big('0.09004392386530014641'),
        grossPerformancePercentageWithCurrencyEffect: new Big(
          '0.09004392386530014641'
        ),
        grossPerformanceWithCurrencyEffect: new Big('24.6'),
        hasErrors: false,
        netPerformance: new Big('23.05'),
        netPerformancePercentage: new Big('0.08437042459736456808'),
        netPerformancePercentageWithCurrencyEffect: new Big(
          '0.08437042459736456808'
        ),
        netPerformanceWithCurrencyEffect: new Big('23.05'),
        positions: [
          {
            averagePrice: new Big('136.6'),
            currency: 'CHF',
            dataSource: 'YAHOO',
            fee: new Big('1.55'),
            firstBuyDate: '2021-11-30',
            grossPerformance: new Big('24.6'),
            grossPerformancePercentage: new Big('0.09004392386530014641'),
            grossPerformancePercentageWithCurrencyEffect: new Big(
              '0.09004392386530014641'
            ),
            grossPerformanceWithCurrencyEffect: new Big('24.6'),
            investment: new Big('273.2'),
            investmentWithCurrencyEffect: new Big('273.2'),
            netPerformance: new Big('23.05'),
            netPerformancePercentage: new Big('0.08437042459736456808'),
            netPerformancePercentageWithCurrencyEffect: new Big(
              '0.08437042459736456808'
            ),
            netPerformanceWithCurrencyEffect: new Big('23.05'),
            marketPrice: 148.9,
            marketPriceInBaseCurrency: 148.9,
            quantity: new Big('2'),
            symbol: 'BALN.SW',
            timeWeightedInvestment: new Big('273.2'),
            timeWeightedInvestmentWithCurrencyEffect: new Big('273.2'),
            transactionCount: 1
          }
        ],
        totalInvestment: new Big('273.2'),
        totalInvestmentWithCurrencyEffect: new Big('273.2')
      });

      expect(investments).toEqual([
        { date: '2021-11-30', investment: new Big('273.2') }
      ]);

      expect(investmentsByMonth).toEqual([
        { date: '2021-11-01', investment: 273.2 },
        { date: '2021-12-01', investment: 0 }
      ]);
    });
  });
});
